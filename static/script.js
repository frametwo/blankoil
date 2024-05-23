document.addEventListener('DOMContentLoaded', function () {
  const brandDropdown = document.getElementById('brandDropdown');
  const modelDropdown = document.getElementById('modelDropdown');
  const yearDropdown = document.getElementById('yearDropdown');
  const engineTypeDropdown = document.getElementById('engineTypeDropdown');
  const checkButton = document.getElementById('checkButton');
  const resultBox = document.getElementById('result');
  const loader = document.getElementById('loader');
  const amazonLinksContainer = document.getElementById('amazonLinks');
  const separator = document.getElementById('separator');

  fetch('/api/brands')
    .then(response => response.json())
    .then(brands => {
      brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandDropdown.appendChild(option);
      });
    });

  brandDropdown.addEventListener('change', () => {
    modelDropdown.innerHTML = '<option value="" disabled selected>Select Model</option>';
    yearDropdown.innerHTML = '<option value="" disabled selected>Select Year</option>';
    engineTypeDropdown.innerHTML = '<option value="" disabled selected>Select Engine Type</option>';
    modelDropdown.disabled = false;
    yearDropdown.disabled = true;
    engineTypeDropdown.disabled = true;
    checkButton.disabled = true;
    resultBox.innerHTML = '';
    amazonLinksContainer.innerHTML = '';
    separator.style.display = 'none';

    fetch(`/api/models?brand=${encodeURIComponent(brandDropdown.value)}`)
      .then(response => response.json())
      .then(models => {
        models.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelDropdown.appendChild(option);
        });
        modelDropdown.disabled = false;
      });
  });

  modelDropdown.addEventListener('change', () => {
    yearDropdown.innerHTML = '<option value="" disabled selected>Select Year</option>';
    engineTypeDropdown.innerHTML = '<option value="" disabled selected>Select Engine Type</option>';
    yearDropdown.disabled = false;
    engineTypeDropdown.disabled = true;
    checkButton.disabled = true;
    resultBox.innerHTML = '';
    amazonLinksContainer.innerHTML = '';
    separator.style.display = 'none';

    fetch(`/api/years?brand=${encodeURIComponent(brandDropdown.value)}&model=${encodeURIComponent(modelDropdown.value)}`)
      .then(response => response.json())
      .then(years => {
        years.forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          yearDropdown.appendChild(option);
        });
        yearDropdown.disabled = false;
      });
  });

  yearDropdown.addEventListener('change', () => {
    engineTypeDropdown.innerHTML = '<option value="" disabled selected>Select Engine Type</option>';
    engineTypeDropdown.disabled = false;
    checkButton.disabled = true;
    resultBox.innerHTML = '';
    amazonLinksContainer.innerHTML = '';
    separator.style.display = 'none';

    fetch(`/api/engine_types?brand=${encodeURIComponent(brandDropdown.value)}&model=${encodeURIComponent(modelDropdown.value)}&year=${encodeURIComponent(yearDropdown.value)}`)
      .then(response => response.json())
      .then(engine_types => {
        engine_types.forEach(engine_type => {
          const option = document.createElement('option');
          option.value = engine_type;
          option.textContent = engine_type;
          engineTypeDropdown.appendChild(option);
        });
        engineTypeDropdown.disabled = false;
      });
  });

  engineTypeDropdown.addEventListener('change', () => {
    checkButton.disabled = false;
    resultBox.innerHTML = '';
    amazonLinksContainer.innerHTML = '';
    separator.style.display = 'none';
  });

  checkButton.addEventListener('click', () => {
    searchOilType(brandDropdown.value, modelDropdown.value, yearDropdown.value, engineTypeDropdown.value);
  });

  function searchOilType(brand, model, year, engine_type) {
    loader.style.display = 'inline-block';
    resultBox.innerHTML = '';
    amazonLinksContainer.innerHTML = '';
    separator.style.display = 'none';

    fetch(`/api/oil?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&engine_type=${encodeURIComponent(engine_type)}`)
      .then(response => response.json())
      .then(data => {
        loader.style.display = 'none';
        if (data === 'Oil type not found') {
          resultBox.innerHTML = '<p class="error-message">Oil type not found. Please check the details.</p>';
        } else {
          resultBox.innerHTML = `<p class="result-message highlight">The recommended oil type for your ${brand} ${model} ${year} with ${engine_type} engine is: <strong class="oil-type">${data.oil_type}</strong></p>`;
          if (data.amazon_link) {
            displayAmazonLink(data.amazon_link, data.image_url);
          }
          separator.style.display = 'block';
        }
      });
  }

  function displayAmazonLink(link, imageUrl) {
    amazonLinksContainer.innerHTML = '';
    const amazonItem = document.createElement('div');
    amazonItem.className = 'amazon-item';

    if (imageUrl) {
      const thumbnail = document.createElement('img');
      thumbnail.src = imageUrl;
      thumbnail.alt = 'Amazon Product Image';
      thumbnail.className = 'amazon-thumbnail';
      amazonItem.appendChild(thumbnail);
    }

    const title = document.createElement('p');
    title.textContent = 'View on Amazon';
    title.className = 'amazon-title';

    const amazonLink = document.createElement('a');
    amazonLink.href = link;
    amazonLink.textContent = 'Visit';
    amazonLink.className = 'amazon-link';
    amazonLink.target = '_blank';

    amazonItem.appendChild(title);
    amazonItem.appendChild(amazonLink);

    amazonLinksContainer.appendChild(amazonItem);
  }
});
