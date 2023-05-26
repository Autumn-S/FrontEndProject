function initializeSearch() {
  const searchBar = document.getElementById("searchBar");
  const categorySelect = document.getElementById("categorySelect");
  const searchButton = document.getElementById("searchButton");
  const resultContainer = document.getElementById("resultContainer");

  searchButton.addEventListener("click", performSearch);

  function performSearch() {
    const searchTerm = searchBar.value;
    const category = categorySelect.value;
    const apiUrl = `http://acnhapi.com/v1/${category}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const dataArray = Object.values(data); // Convert data into an array
        const filteredResults = filterResults(dataArray, searchTerm);
        displayResults(filteredResults);
        console.log(filteredResults);

        // Change background color of item elements
        var itemDivs = document.getElementsByClassName("item");
        var selectedCategory = categorySelect.value;
        for (var i = 0; i < itemDivs.length; i++) {
          itemDivs[i].className = "item " + selectedCategory;
        }

        var mainBody = document.body;
        mainBody.className = "main-body " + selectedCategory;
        searchBar.value = "";
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }

  function filterResults(dataArray, searchTerm) {
    return dataArray.filter((result) =>
      result.name["name-USen"].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function createCheckbox(name, label) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = name;

    const checkboxLabel = document.createElement("label");
    checkboxLabel.textContent = label;
    checkboxLabel.setAttribute("for", name);

    return { checkbox, checkboxLabel };
  }

  function handleCaughtList(itemElement, itemName) {
    const { checkbox, checkboxLabel } = createCheckbox(
      itemName,
      "Mark as Caught"
    );

    itemElement.appendChild(checkbox);
    itemElement.appendChild(checkboxLabel);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!caughtList.includes(itemName)) {
          caughtList.push(itemName);
        } else {
          const confirmRemove = window.confirm(
            `Item is already saved in the caught list: ${itemName}`
          );
          if (!confirmRemove) {
            checkbox.checked = true; // Restore the checkbox state
            return; // Exit the event listener
          }
        }
      } else {
        const itemIndex = caughtList.indexOf(itemName);
        if (itemIndex !== -1) {
          caughtList.splice(itemIndex, 1);
        }
      }
      localStorage.setItem("caughtList", JSON.stringify(caughtList));
      console.log("Caught List:", caughtList);
    });
  }

  function handleMuseumDonation(itemElement, itemName) {
    const { checkbox, checkboxLabel } = createCheckbox(
      itemName,
      "Donate to Museum"
    );

    itemElement.appendChild(checkbox);
    itemElement.appendChild(checkboxLabel);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!donationList.includes(itemName)) {
          donationList.push(itemName);
        } else {
          const confirmRemove = window.confirm(
            `Item is already saved in the donation list: ${itemName}`
          );
          if (!confirmRemove) {
            checkbox.checked = true; // Restore the checkbox state
            return; // Exit the event listener
          }
        }
      } else {
        const itemIndex = donationList.indexOf(itemName);
        if (itemIndex !== -1) {
          donationList.splice(itemIndex, 1);
        }
      }
      localStorage.setItem("donationList", JSON.stringify(donationList));
      console.log("Donation List:", donationList);
    });
  }

  let caughtList = getStoredList("caughtList");
  let donationList = getStoredList("donationList");

  // Function to retrieve a list from local storage
  function getStoredList(listName) {
    const listString = localStorage.getItem(listName);
    return listString ? JSON.parse(listString) : [];
  }

  function displayCaughtList() {
    const caughtList = getStoredList("caughtList");
    const caughtListContainer = document.getElementById("caughtList");
    caughtListContainer.innerHTML = "";
  
    const caughtListHeader = document.createElement("h2");
    caughtListHeader.textContent = "Caught List";
    caughtListContainer.appendChild(caughtListHeader);
  
    if (caughtList.length > 0) {
      const caughtListElement = document.createElement("ul");
  
      caughtList.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        caughtListElement.appendChild(listItem);
      });
  
      caughtListContainer.appendChild(caughtListElement);
  
      const closeButton = document.createElement("button");
      closeButton.textContent = "x";
      closeButton.addEventListener("click", () => {
        caughtListContainer.innerHTML = "";
        document.body.classList.remove("hidden");
      });
      caughtListContainer.appendChild(closeButton);
    } else {
      caughtListContainer.innerHTML = "No items in the caught list.";
    }
  
    document.body.classList.add("hidden");
  }

  function displayDonationList() {
    const donationList = getStoredList("donationList");
    const donationListContainer = document.getElementById("donationList");
    donationListContainer.innerHTML = "";
  
    const donationListHeader = document.createElement("h2");
    donationListHeader.textContent = "Donation List";
    donationListContainer.appendChild(donationListHeader);
  
    if (donationList.length > 0) {
      const donationListElement = document.createElement("ul");
  
      donationList.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        donationListElement.appendChild(listItem);
      });
  
      donationListContainer.appendChild(donationListElement);
  
      const closeButton = document.createElement("button");
      closeButton.textContent = "x";
      closeButton.addEventListener("click", () => {
        donationListContainer.innerHTML = "";
        document.body.classList.remove("hidden");
      });
      donationListContainer.appendChild(closeButton);
    } else {
      donationListContainer.innerHTML = "No items in the donation list.";
    }
  
    document.body.classList.add("hidden");
  }

  function handleClickDisplayLists() {
    displayCaughtList();
    displayDonationList();
  }

  const displayListsButton = document.getElementById("displayListsButton");
  displayListsButton.addEventListener("click", handleClickDisplayLists);

  function displayResults(data) {
    resultContainer.innerHTML = "";

    data.forEach((result) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("item");

      // Display image
      if (result.image_uri) {
        const imageElement = createImageElement(
          result.image_uri,
          result.name["name-USen"]
        );
        itemElement.appendChild(imageElement);
      }

      const textParent = document.createElement("div");
      const nameElement = createNameElement(result.name["name-USen"]);
      itemElement.appendChild(nameElement);

      // Display availability
      if (result.availability) {
        const availabilityElement = createAvailabilityElement();
        textParent.appendChild(availabilityElement);

        // Display location and month availability
        const hemisphere = getHemisphere();
        const monthArray = result.availability[`month-array-${hemisphere}`];
        if (monthArray) {
          const availabilityText = getAvailabilityText(monthArray);
          const availabilityTextElement =
            createAvailabilityTextElement(availabilityText);
          availabilityElement.appendChild(availabilityTextElement);
        }

        // Display time availability
        const time = getTimeAvailability(result.availability);
        const timeTextElement = createTimeTextElement(time);
        textParent.appendChild(timeTextElement);
      }

      // Display price
      if (result.price) {
        const priceElement = createPriceElement(result.price);
        textParent.appendChild(priceElement);
      }

      if (result["price-cj"]) {
        const cjPriceElement = createCjPriceElement(result["price-cj"]);
        textParent.appendChild(cjPriceElement);
      }

      itemElement.appendChild(textParent);
      handleCheckboxes(itemElement, result.name["name-USen"]);
      resultContainer.appendChild(itemElement);
    });
  }

  function createImageElement(imageUri, altText) {
    const imageElement = document.createElement("img");
    imageElement.src = imageUri;
    imageElement.alt = altText;
    return imageElement;
  }

  function createNameElement(name) {
    const nameElement = document.createElement("div");
    const capitalizedNames = capitalizeWords(name);
    nameElement.textContent = capitalizedNames;
    return nameElement;
  }

  function createAvailabilityElement() {
    const availabilityElement = document.createElement("div");
    availabilityElement.innerHTML = "Available Thru: ";
    return availabilityElement;
  }

  function getHemisphere() {
    const category = categorySelect.value;
    if (category === "fish" || category === "bugs" || category === "sea") {
      return document.querySelector('input[name="hemisphere"]:checked').value;
    }
    return null;
  }

  function getAvailabilityText(monthArray) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthStart = monthNames[monthArray[0] - 1];
    const monthEnd = monthNames[monthArray[monthArray.length - 1] - 1];
    return monthArray.length === 1 ? monthStart : `${monthStart} - ${monthEnd}`;
  }

  function createAvailabilityTextElement(availabilityText) {
    const availabilityTextElement = document.createElement("span");
    availabilityTextElement.textContent = availabilityText;
    return availabilityTextElement;
  }

  function getTimeAvailability(availability) {
    return availability.isAllDay
      ? "All Day"
      : availability.time || "Unavailable";
  }

  function createTimeTextElement(time) {
    const timeElement = document.createElement("span");
    const timeTextElement = document.createElement("div");
    timeTextElement.innerHTML = "Time of Day: ";
    timeElement.textContent = time;
    timeTextElement.appendChild(timeElement);
    return timeTextElement;
  }

  function createPriceElement(price) {
    const priceElement = document.createElement("div");
    priceElement.innerHTML = `Tom Nook's Sell Price: ${price}`;
    return priceElement;
  }

  function createCjPriceElement(cjPrice) {
    const cjPriceElement = document.createElement("div");
    cjPriceElement.innerHTML = `CJ's Sell Price: ${cjPrice}`;
    return cjPriceElement;
  }

  function handleCheckboxes(itemElement, name) {
    handleCaughtList(itemElement, name);
    handleMuseumDonation(itemElement, name);
  }

  function capitalizeWords(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

initializeSearch();
