/// <summary>
///  Селекторы для элементов DOM.
/// </summary>
const toggleSwitch = document.querySelector("#toggle-dark-mode");
const animalList = document.querySelector(".container-products");
const searchInput = document.querySelector("#searchInput");
const totalProductsElement = document.getElementById("total-products");
const displayedProductsElement = document.getElementById("displayed-products");

/// <summary>
/// Массивы для хранения всех товаров и текущих отфильтрованных/отсортированных товаров.
/// </summary>
let allProducts = [];
let currentProducts = []; // Хранит текущий набор отфильтрованных и отсортированных товаров

/// <summary>
/// Обработчик события клика по списку продуктов.
/// </summary>
/// <param name="event">Событие клика.</param>
animalList.addEventListener("click", handleAnimalListClick);
document.getElementById('add-link').addEventListener('click', handleAnimalListClick);

/// <summary>
/// Функция настройки функционала поиска.
/// </summary>
function setupSearch() {
  searchInput.addEventListener('input', handleSearch);
}

/// <summary>
/// Функция обработки ввода поиска и фильтрации товаров.
/// </summary>
/// <param name="event">Событие ввода.</param>
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredProducts = currentProducts.filter(product => {
    const titleMatch = product.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
    const costMatch = product.cost.toString().includes(searchTerm);
    return titleMatch || descriptionMatch || costMatch;
  });
  renderAllProducts(filteredProducts);
  updateProductInfo(allProducts.length, filteredProducts.length);
}

/// <summary>
/// Функция заполнения выпадающего списка фильтров по производителям.
/// </summary>
/// <param name="manufacturers">Массив производителей.</param>
function populateManufacturerFilter(manufacturers) {
  const filterSelect = document.getElementById('filterSelect');
  filterSelect.innerHTML = ''; // Очищаем комбобокс

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Все элементы';
  filterSelect.appendChild(allOption);

  manufacturers.forEach(manufacturer => {
    const option = document.createElement('option');
    option.value = manufacturer.id;
    option.textContent = manufacturer.name;
    filterSelect.appendChild(option);
  });
}

/// <summary>
/// Обработчик события изменения фильтра по производителю.
/// </summary>
document.getElementById('filterSelect').addEventListener('change', function() {
  const selectedManufacturerId = this.value;
  if (selectedManufacturerId === 'all') {
    currentProducts = allProducts;
  } else {
    currentProducts = allProducts.filter(product => product.manufacturerid == selectedManufacturerId);
  }
  renderAllProducts(currentProducts);
  updateProductInfo(allProducts.length, currentProducts.length);
});

/// <summary>
/// Функция обработки события отправки формы для добавления нового товара.
/// </summary>
/// <param name="event">Событие отправки формы.</param>
function handleAnimalFormSubmit(event) {
  event.preventDefault();
  const animalObj = {
    id: event.target.id.value,
    title: event.target.title.value,
    mainimagepath: event.target.mainimagepath.value,
    cost: event.target.cost.value,
    isactive: event.target.isactive.value,
    manufacturerid: event.target.manufacturerid.value,
    description: event.target.description.value,
  };
  createProduct(animalObj)
    .then(newAnimalObj => {
      renderOneProduct(newAnimalObj);
      allProducts.push(newAnimalObj); 
      currentProducts.push(newAnimalObj);
      updateProductInfo(allProducts.length, animalList.childElementCount);
      console.log('Success:', newAnimalObj);
    });

  event.target.reset();
}

/// <summary>
/// Функция обработки событий клика по списку продуктов.
/// </summary>
/// <param name="event">Событие клика.</param>
function handleAnimalListClick(event) {
  if (event.target.matches(".delete-button")) {
    const button = event.target;
    const card = button.closest(".card");
    const id = card.dataset.id;

    const isConfirmed = confirm("Вы уверены, что хотите удалить этот товар?");

    if (isConfirmed) {
      fetch(`/db.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Ошибка сети');
          }
          return response.json();
        })
        .then(data => {
          const productsale = data.productsale;
          if (!Array.isArray(productsale) || productsale.length === 0) {
            throw new Error('Таблица productsale не найдена');
          }

          const productIdNumber = Number(id);
          const productHistory = productsale.filter(item => item.productid === productIdNumber);

          if (productHistory.length > 0) {
            alert('Удаление товара запрещено, так как у него есть информация о продажах.');
          } else {
            deleteAttachedProducts(id)
              .then(() => {
                deleteProduct(id)
                  .then(data => {
                    console.log('Success:', data);
                    card.remove();
                    allProducts = allProducts.filter(product => product.id !== id); // Обновление списка всех продуктов
                    currentProducts = currentProducts.filter(product => product.id !== id); // Обновление текущего списка продуктов
                    updateProductInfo(allProducts.length, animalList.childElementCount);
                  })
                  .catch(error => {
                    console.error('Error:', error);
                  });
              })
              .catch(error => {
                console.error('Ошибка при удалении прикрепленных товаров:', error);
              });
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки истории:', error);
        });
    }

  } else if (event.target.dataset.action === "edit") {
    const button = event.target;
    const card = button.closest(".card");
    const id = card.dataset.id;
    localStorage.setItem('editItemId', id); 
    window.location.href = `history.html`;
  }
  else if (event.target.dataset.action === "history") {
    const button = event.target;
    const card = button.closest(".card");
    const id = card.dataset.id;

    fetch('/db.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети');
        }
        return response.json();
      })
      .then(data => {
        console.log('Данные из db.json:', data);
        const productsale = data.productsale;
        if (!Array.isArray(productsale) || productsale.length === 0) {
          throw new Error('Таблица productsale не найдена');
        }
        console.log('Таблица productsale:', productsale);
        const productIdNumber = Number(id);
        const productHistory = productsale.filter(item => item.productid === productIdNumber);
        if (productHistory.length > 0) {
          console.log('История товара:', productHistory);
          showHistoryPopup(productHistory);
        } else {
          alert('История для этого товара не найдена.');
        }
      })
      .catch(error => {
        console.error('Ошибка загрузки истории:', error);
      });
  }

  else if (event.target.dataset.action === "add") {
    localStorage.removeItem('editItemId'); // Очищаем ID товара
    window.location.href = 'history.html'; // Перенаправляем на страницу history.html
  }
}

/// <summary>
/// Функция удаления прикрепленных товаров.
/// </summary>
/// <param name="mainProductId">Идентификатор основного товара.</param>
function deleteAttachedProducts(mainProductId) {
  return fetch(`http://localhost:3000/attachedproduct?mainproductid=${mainProductId}`)
    .then(response => response.json())
    .then(attachedProducts => {
      const deletePromises = attachedProducts.map(attachedProduct => {
        return fetch(`http://localhost:3000/attachedproduct/${attachedProduct.id}`, {
          method: 'DELETE'
        });
      });
      return Promise.all(deletePromises);
    });
}

/// <summary>
/// Функция удаления товара.
/// </summary>
/// <param name="id">Идентификатор товара для удаления.</param>
function deleteProduct(id) {
  return fetch(`http://localhost:3000/product/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Ошибка при удалении товара");
      }
    });
}

/// <summary>
/// Функция отображения всплывающего окна истории.
/// </summary>
/// <param name="history">Массив элементов истории товара.</param>
function showHistoryPopup(history) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close">&times;</span>
      <h2>История товара</h2>
      <ul>
        ${history.map(item => `<li>${item.saledate}: Продано ${item.quantity} шт.</li>`).join('')}
      </ul>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector('.close').addEventListener('click', () => {
    popup.remove();
  });

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.remove();
    }
  });
}

/// <summary>
/// Функция рендеринга карточки товара.
/// </summary>
/// <param name="animalObj">Объект товара для рендеринга.</param>
function renderOneProduct(animalObj) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = animalObj.id;

  let imageSrc;
  if (Array.isArray(animalObj.mainimagepath)) {
    const byteArray = new Uint8Array(animalObj.mainimagepath);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    imageSrc = URL.createObjectURL(blob);
  } else {
    imageSrc = animalObj.mainimagepath;
  }
  
  getAttachedProducts(animalObj.id)
    .then(attachedProducts => {
      const activeAttachedProductsPromises = attachedProducts.map(product => {
        return getProductById(product.attachedproductid)
          .then(productDetails => {
            return productDetails.isactive;
          });
      });

      Promise.all(activeAttachedProductsPromises)
        .then(activeAttachedProductsStatuses => {
          const attachedCount = activeAttachedProductsStatuses.filter(status => status).length;

          card.innerHTML = `
            <div class="card-body" style="background-color: ${animalObj.isactive ? 'white' : 'lightgray'};">  
              <button class="button delete-button" data-action="delete">X</button>
              <div class="image">
                <img src="${imageSrc}" alt="...">
              </div>
              <h5 class="card-title">${animalObj.title} (${attachedCount})</h5>
              <p class="card-text">${animalObj.cost}</p>
              <button class="button edit-button" data-action="edit">
                Изменить
              </button>
              <button class="button history-button" data-action="history">
        История
      </button>
            </div>
          `;

          animalList.append(card);
          updateProductInfo(allProducts.length, animalList.childElementCount);
        })
        .catch(error => {
          console.error('Error fetching attached products:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching attached products:', error);
    });
}

/// <summary>
/// Функция получения информации о товаре по ID.
/// </summary>
/// <param name="id">ID товара.</param>
function getProductById(id) {
  return fetch(`http://localhost:3000/product/${id}`)
    .then(response => response.json());
}

/// <summary>
/// Функция рендеринга всех товаров.
/// </summary>
/// <param name="animalData">Массив товаров для рендеринга.</param>
function renderAllProducts(animalData) {
  animalList.innerHTML = ""; 
  animalData.forEach(renderOneProduct);
  updateProductInfo(allProducts.length, animalList.childElementCount);
}

/// <summary>
/// Функция сортировки продуктов в порядке возрастания.
/// </summary>
function sortProductsAsc() {
  currentProducts.sort((a, b) => a.cost - b.cost);
  renderAllProducts(currentProducts);
}

/// <summary>
/// Функция сортировки продуктов в порядке убывания.
/// </summary>
function sortProductsDesc() {
  currentProducts.sort((a, b) => b.cost - a.cost);
  renderAllProducts(currentProducts);
}

/// <summary>
/// Функция отмены сортировки и возврата к исходному порядку.
/// </summary>
function sortProductsCancel() {
  currentProducts = [...allProducts]; // Возвращаемся к исходному порядку
  renderAllProducts(currentProducts);
}

/// <summary>
/// Обработчик события изменения выбора сортировки.
/// </summary>
document.getElementById('sortSelect').addEventListener('change', function() {
  const selectedValue = this.value;
  if (selectedValue === 'asc') {
    sortProductsAsc();
  } else if (selectedValue === 'desc') {
    sortProductsDesc();
  } else if (selectedValue === 'cancel') {
    sortProductsCancel();
  }
}); 

/// <summary>
/// Функция обновления информации о товарах (общее количество и отображаемое).
/// </summary>
/// <param name="total">Общее количество товаров.</param>
/// <param name="displayed">Количество отображаемых товаров.</param>
function updateProductInfo(total, displayed) {
  totalProductsElement.textContent = total;
  displayedProductsElement.textContent = displayed;
}

/// <summary>
/// Функция инициализации приложения.
/// </summary>
function initialize() {
  Promise.all([getAllProducts(), getAllManufacturers()])
    .then(([animalArray, manufacturers]) => {
      allProducts = animalArray; // Хранение всех продуктов
      currentProducts = animalArray;
      renderAllProducts(animalArray);
      setupSearch();
      populateManufacturerFilter(manufacturers);
      updateProductInfo(allProducts.length, animalList.childElementCount);
    })
    .catch(errors => {
      alert("Uh oh! Something went wrong!");
    });
}

initialize();

/// <summary>
/// Функция получения всех продуктов с сервера.
/// </summary>
function getAllProducts() {
  return fetch("http://localhost:3000/product")
    .then(response => response.json());
}

/// <summary>
/// Функция получения всех производителей с сервера.
/// </summary>
function getAllManufacturers() {
  return fetch("http://localhost:3000/manufacturer")
    .then(response => response.json());
}

/// <summary>
/// Функция получения прикрепленных товаров для основного товара.
/// </summary>
/// <param name="mainProductId">Идентификатор основного товара.</param>
function getAttachedProducts(mainProductId) {
  return fetch(`http://localhost:3000/attachedproduct?mainproductid=${mainProductId}`)
    .then(response => response.json());
}