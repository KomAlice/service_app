const id = localStorage.getItem('editItemId');
let product; // Объявляем product как глобальную переменную
let attachedProductsList = []; 
if (id === null || id === '') {
    document.getElementById('namePage').textContent = 'Добавление товара';
    let id = document.getElementById("id");
    let idTitle = document.getElementById("idTitle");
   
    idTitle.style.display = "none"; // Полностью удаляет элемент из потока документа
    
    id.style.display = "none"; // Полностью удаляет элемент из потока документа

} else {
    document.getElementById('namePage').textContent = 'Редактирование товара';
}

/// <summary>
/// Функция получения производителя по его ID.
/// </summary>
/// <param name="id">Идентификатор производителя.</param>
function getManufacturerById(id) {
    return fetch(`http://localhost:3000/manufacturer/${id}`)
        .then(response => response.json());
}

/// <summary>
/// Функция для получения прикрепленных продуктов к основному продукту
/// </summary>
/// <param name="mainProductId">Идентификатор основного продукта</param>
function getAttachedProducts(mainProductId) {
    return fetch(`http://localhost:3000/attachedproduct?mainproductid=${mainProductId}`)
        .then(response => response.json());
}

/// <summary>
/// Функция для получения продукта по его идентификатору
/// </summary>
/// <param name="id">Идентификатор продукта</param>
function getProductById(id) {
    return fetch(`http://localhost:3000/product/${id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Ошибка при получении продукта");
            }
        });
}

/// <summary>
/// Функция для получения всех продуктов
/// </summary>
function getAllProducts() {
    return fetch(`http://localhost:3000/product`)
        .then(response => response.json());
}

if (id) {
    // Загружаем данные товара по ID
    getProductById(id)
        .then(data => {
            product = data; // Присваиваем значение product
            console.log('Данные о товаре:', product);
            // Заполняем поля формы данными товара
            document.getElementById("id").value = product.id;
            document.getElementById("title").value = product.title;
            document.getElementById("cost").value = product.cost;
            document.getElementById("description").value = product.description;

            // Устанавливаем значение поля isactive
            const isactiveSelect = document.getElementById("isactive");
            isactiveSelect.value = product.isactive ? "true" : "false";

            // Если есть изображение, отображаем его
            const imageContainer = document.getElementById("image-container");
            if (product.mainimagepath) {
                if (Array.isArray(product.mainimagepath)) {
                    // Если mainimagepath - массив байтов, преобразуем его в изображение
                    const byteArray = new Uint8Array(product.mainimagepath);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Укажите правильный тип изображения
                    const imageUrl = URL.createObjectURL(blob);
                    const imgElement = document.createElement("img");
                    imgElement.src = imageUrl;
                    imgElement.alt = product.title;
                    imageContainer.appendChild(imgElement);
                } else {
                    // Если mainimagepath - строка, используем её как URL изображения
                    const imgElement = document.createElement("img");
                    imgElement.src = product.mainimagepath;
                    imgElement.alt = product.title;
                    imageContainer.appendChild(imgElement);
                }
            } else {
                const imgElement = document.createElement("img");
                imgElement.src = "./ServiceProducts/nophoto.png";
                imgElement.alt = "нет фото";
                imageContainer.appendChild(imgElement);
            }

            // Обработчик события для выбора файла
            document.getElementById("mainimagepath").addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imgElement = document.createElement("img");
                        imgElement.src = e.target.result;
                        imgElement.alt = "выбранное фото";
                        // Удаляем старое изображение, если оно есть
                        while (imageContainer.firstChild) {
                            imageContainer.removeChild(imageContainer.firstChild);
                        }
                        imageContainer.appendChild(imgElement);
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Загружаем данные о всех производителях
            return getAllManufacturers().then(manufacturers => {
                console.log('Данные о производителях:', manufacturers);
                // Заполняем комбобокс данными о производителях
                const manufacturerSelect = document.getElementById("manufacturer");
                manufacturers.forEach(manufacturer => {
                    const option = document.createElement("option");
                    option.value = manufacturer.id;
                    option.text = manufacturer.name;
                    manufacturerSelect.appendChild(option);
                });

                return getManufacturerById(product.manufacturerid).then(manufacturerData => {
                    // Устанавливаем выбранный элемент в комбобокс
                    const selectedOption = manufacturerSelect.querySelector(`option[value="${manufacturerData.id}"]`);
                    if (selectedOption) {
                        selectedOption.selected = true;
                    }
                }).catch(error => console.error("Ошибка получения производителя:", error));
            });
        })
        .then(() => {
            // Загружаем прикрепленные продукты
            return getAttachedProducts(id).then(attachedProducts => {
                const attachedProductsGrid = document.getElementById("attachedProductsGrid");
                attachedProducts.forEach(attachedProduct => {
                    getProductById(attachedProduct.attachedproductid).then(attachedProductData => {
                        // Проверяем, активен ли товар
                        if (attachedProductData.isactive) {
                            const col = document.createElement("div");
                            col.className = "col-12 mb-3";

                            const card = document.createElement("div");
                            card.className = "card";
                            card.title = `${attachedProductData.title} - ${attachedProductData.cost}`;

                            const cardBody = document.createElement("div");
                            cardBody.className = "card-body d-flex align-items-center";

                            const imgElement = document.createElement("img");
                            if (Array.isArray(attachedProductData.mainimagepath)) {
                                const byteArray = new Uint8Array(attachedProductData.mainimagepath);
                                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                                const imageUrl = URL.createObjectURL(blob);
                                imgElement.src = imageUrl;
                                imgElement.alt = attachedProductData.title;
                            } else {
                                // Если mainimagepath - строка, используем её как URL изображения
                                imgElement.src = attachedProductData.mainimagepath;
                                imgElement.alt = attachedProductData.title;
                            }
                            imgElement.className = "card-img-top me-3";
                            imgElement.style.width = "100px"; // Устанавливаем ширину изображения

                            const titleElement = document.createElement("h5");
                            titleElement.className = "card-title";
                            titleElement.textContent = attachedProductData.title;

                            const deleteButton = document.createElement("button");
                            deleteButton.className = "delete-button";
                            deleteButton.innerHTML = "X"; 
                            deleteButton.style.position = "absolute";
                            deleteButton.style.top = "10px";
                            deleteButton.style.right = "10px";
                            deleteButton.style.opacity = "0.7";
                            deleteButton.style.backgroundColor = "transparent";
                            deleteButton.style.border = "none";
                            deleteButton.style.cursor = "pointer";

                            deleteButton.addEventListener('click', function() {
                                const isConfirmed = confirm("Вы уверены, что хотите удалить этот связанный товар?");
                                if (isConfirmed) {
                                    // Удаляем карту товара
                                    card.remove();
                                    // Удаляем запись из таблицы attachedproduct
                                    deleteAttachedProduct(attachedProduct.id)
                                        .then(response => {
                                            console.log("Связанный товар успешно удален:", response);
                                        })
                                        .catch(error => {
                                            console.error("Ошибка при удалении связанного товара:", error);
                                        });
                                }
                            });

                            cardBody.appendChild(imgElement);
                            cardBody.appendChild(titleElement);
                            cardBody.appendChild(deleteButton);
                            card.appendChild(cardBody);
                            col.appendChild(card);
                            attachedProductsGrid.appendChild(col);
                        }
                    }).catch(error => console.error("Ошибка при получении прикрепленного продукта:", error));
                });

                // Добавляем кнопку для добавления нового товара
                const addButtonContainer = document.createElement("div");
                addButtonContainer.style.display = "grid";
                addButtonContainer.style.placeItems = "center"; // Центрируем содержимое по центру грида
                addButtonContainer.style.margin = "20px 0";

                const addButton = document.createElement("button");
                addButton.className = "add-button";
                addButton.innerHTML = "+";
                addButton.style.borderRadius = "50%";
                addButton.style.width = "40px";
                addButton.style.height = "40px";
                addButton.style.display = "flex";
                addButton.style.alignItems = "center";
                addButton.style.justifyContent = "center";
                addButton.style.fontSize = "24px";
                addButton.style.marginLeft = "190px";
                addButton.style.marginBottom = "20px";

                addButton.addEventListener('click', function(event) {
                    event.preventDefault(); // Предотвращаем стандартное поведение
                    const popup = document.getElementById('popup');
                    popup.style.display = 'flex';
                    addButton.remove();

                    // Получаем список уже связанных товаров
                    getAttachedProducts(id).then(attachedProducts => {
                        const attachedProductIds = attachedProducts.map(attachedProduct => attachedProduct.attachedproductid);

                        // Загружаем все товары и отображаем только активные товары в попапе, исключая текущий товар и уже связанные товары
                        getAllProducts().then(products => {
                            const activeProducts = products.filter(product => product.isactive && product.id !== id && !attachedProductIds.includes(product.id));

                            const productsGrid = document.getElementById('productsGrid');
                            productsGrid.innerHTML = ''; // Очищаем предыдущие данные

                            activeProducts.forEach(product => {
                                const card = document.createElement('div');
                                card.className = 'product-card';
                                card.dataset.id = product.id;

                                const imgElement = document.createElement('img');
                                if (Array.isArray(product.mainimagepath)) {
                                    const byteArray = new Uint8Array(product.mainimagepath);
                                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                                    const imageUrl = URL.createObjectURL(blob);
                                    imgElement.src = imageUrl;
                                } else {
                                    imgElement.src = product.mainimagepath;
                                }
                                imgElement.alt = product.title;

                                const titleElement = document.createElement('h5');
                                titleElement.textContent = product.title;

                                card.appendChild(imgElement);
                                card.appendChild(titleElement);
                                productsGrid.appendChild(card);

                                // Обработчик события для выбора товара
                                card.addEventListener('click', function() {
                                    const productId = this.dataset.id;
                                    const mainProductId = id; // ID основного товара

                                    const attachedProduct = {
                                        mainproductid: mainProductId,
                                        attachedproductid: productId
                                    };

                                    createAttachedProduct(attachedProduct)
                                        .then(response => {
                                            console.log("Товар успешно прикреплен:", response);
                                            // Закрываем попап
                                            popup.style.display = 'none';
                                            // Обновляем список прикрепленных товаров
                                            getAttachedProducts(mainProductId).then(attachedProducts => {
                                                const attachedProductsGrid = document.getElementById('attachedProductsGrid');
                                                attachedProductsGrid.innerHTML = ''; // Очищаем предыдущие данные

                                                attachedProducts.forEach(attachedProduct => {
                                                    getProductById(attachedProduct.attachedproductid).then(attachedProductData => {
                                                        if (attachedProductData.isactive) {
                                                            const col = document.createElement('div');
                                                            col.className = 'col-12 mb-3';

                                                            const card = document.createElement('div');
                                                            card.className = 'card';
                                                            card.title = `${attachedProductData.title} - ${attachedProductData.cost}`;

                                                            const cardBody = document.createElement('div');
                                                            cardBody.className = 'card-body d-flex align-items-center';

                                                            const imgElement = document.createElement('img');
                                                            if (Array.isArray(attachedProductData.mainimagepath)) {
                                                                const byteArray = new Uint8Array(attachedProductData.mainimagepath);
                                                                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                                                                const imageUrl = URL.createObjectURL(blob);
                                                                imgElement.src = imageUrl;
                                                            } else {
                                                                imgElement.src = attachedProductData.mainimagepath;
                                                            }
                                                            imgElement.className = 'card-img-top me-3';
                                                            imgElement.style.width = '100px';

                                                            const titleElement = document.createElement('h5');
                                                            titleElement.className = 'card-title';
                                                            titleElement.textContent = attachedProductData.title;

                                                            const deleteButton = document.createElement('button');
                                                            deleteButton.className = 'delete-button';
                                                            deleteButton.innerHTML = 'X';
                                                            deleteButton.style.position = 'absolute';
                                                            deleteButton.style.top = '10px';
                                                            deleteButton.style.right = '10px';
                                                            deleteButton.style.opacity = '0.7';
                                                            deleteButton.style.backgroundColor = 'transparent';
                                                            deleteButton.style.border = 'none';
                                                            deleteButton.style.cursor = 'pointer';

                                                            deleteButton.addEventListener('click', function() {
                                                                const isConfirmed = confirm("Вы уверены, что хотите удалить этот связанный товар?");
                                                                if (isConfirmed) {
                                                                    card.remove();
                                                                    deleteAttachedProduct(attachedProduct.id)
                                                                        .then(response => {
                                                                            console.log("Связанный товар успешно удален:", response);
                                                                        })
                                                                        .catch(error => {
                                                                            console.error("Ошибка при удалении связанного товара:", error);
                                                                        });
                                                                }
                                                            });

                                                            cardBody.appendChild(imgElement);
                                                            cardBody.appendChild(titleElement);
                                                            cardBody.appendChild(deleteButton);
                                                            card.appendChild(cardBody);
                                                            col.appendChild(card);
                                                            attachedProductsGrid.appendChild(col);
                                                        }
                                                    }).catch(error => console.error("Ошибка при получении прикрепленного продукта:", error));
                                                });

                                                // Добавляем кнопку "+" обратно после обновления списка связанных товаров
                                                attachedProductsGrid.appendChild(addButtonContainer);
                                                addButtonContainer.appendChild(addButton);
                                            });
                                        })
                                        .catch(error => {
                                            console.error("Ошибка при прикреплении товара:", error);
                                        });
                                });
                            });
                        });
                    });
                });

                attachedProductsGrid.appendChild(addButtonContainer);
                addButtonContainer.appendChild(addButton);
            });
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при загрузке данных товара или производителей.");
        });
} else {
    const attachedProductsGrid = document.getElementById("attachedProductsGrid");

    // Если ID товара не найден, очищаем поля для ввода
    document.getElementById("id").value = '';
    document.getElementById("title").value = '';
    document.getElementById("cost").value = '';
    document.getElementById("description").value = '';
    document.getElementById("isactive").value = 'true';
    const imageContainer = document.getElementById("image-container");
    while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
    }
    const imgElement = document.createElement("img");
    imgElement.src = "./ServiceProducts/nophoto.png";
    imgElement.alt = "нет фото";
    imageContainer.appendChild(imgElement);

    // Обработчик события для выбора файла
    document.getElementById("mainimagepath").addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgElement = document.createElement("img");
                imgElement.src = e.target.result;
                imgElement.alt = "выбранное фото";
                // Удаляем старое изображение, если оно есть
                while (imageContainer.firstChild) {
                    imageContainer.removeChild(imageContainer.firstChild);
                }
                imageContainer.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        }
    });

    // Загружаем данные о всех производителях
    getAllManufacturers().then(manufacturers => {
        // Заполняем комбобокс данными о производителях
        const manufacturerSelect = document.getElementById("manufacturer");
        manufacturers.forEach(manufacturer => {
            const option = document.createElement("option");
            option.value = manufacturer.id;
            option.text = manufacturer.name;
            manufacturerSelect.appendChild(option);
        });
    }).catch(error => {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при загрузке данных производителей.");
    });

    // Добавляем кнопку для добавления нового товара
    const addButtonContainer = document.createElement("div");
    addButtonContainer.style.display = "grid";
    addButtonContainer.style.placeItems = "center"; // Центрируем содержимое по центру грида
    addButtonContainer.style.margin = "20px 0";

    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.innerHTML = "+"; 
    addButton.style.borderRadius = "50%";
    addButton.style.width = "40px";
    addButton.style.height = "40px";
    addButton.style.display = "flex";
    addButton.style.alignItems = "center";
    addButton.style.justifyContent = "center";
    addButton.style.fontSize = "24px";
    addButton.style.marginLeft = "190px";
    addButton.style.marginBottom = "20px";

    addButton.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';

        addButton.remove();

        // Загружаем все товары и отображаем только активные товары в попапе
        getAllProducts().then(products => {
            const activeProducts = products.filter(product => product.isactive && product.id !== id);

            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = ''; // Очищаем предыдущие данные

            activeProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = product.id;

                const imgElement = document.createElement('img');
                if (Array.isArray(product.mainimagepath)) {
                    const byteArray = new Uint8Array(product.mainimagepath);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    const imageUrl = URL.createObjectURL(blob);
                    imgElement.src = imageUrl;
                } else {
                    imgElement.src = product.mainimagepath;
                }
                imgElement.alt = product.title;

                const titleElement = document.createElement('h5');
                titleElement.textContent = product.title;

                card.appendChild(imgElement);
                card.appendChild(titleElement);
                productsGrid.appendChild(card);

                // Обработчик события для выбора товара
                card.addEventListener('click', function() {
                    const productId = this.dataset.id;
                    attachedProductsList.push(productId);
                    console.log("Выбранные связанные товары:", attachedProductsList);
                    updateAttachedProductsGrid();
                });
            });
        });
    });

    attachedProductsGrid.appendChild(addButtonContainer);
    addButtonContainer.appendChild(addButton);
}

function updateProduct(id, updatedData) {
    return fetch(`http://localhost:3000/product/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Ошибка при обновлении продукта");
            }
        });
}

function createProducts(animalObj) {
    return fetch('http://localhost:3000/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalObj),
    })
        .then(response => response.json());
}

function deleteAttachedProduct(id) {
    return fetch(`http://localhost:3000/attachedproduct/${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Ошибка при удалении связанного товара");
            }
        });
}

function createAttachedProduct(attachedProduct) {
    return fetch('http://localhost:3000/attachedproduct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attachedProduct),
    })
        .then(response => response.json());
}

function updateAttachedProductsGrid() {
    const attachedProductsGrid = document.getElementById("attachedProductsGrid");
    attachedProductsGrid.innerHTML = ''; // Очищаем предыдущие данные

    attachedProductsList.forEach(productId => {
        getProductById(productId).then(productData => {
            if (productData.isactive) {
                const col = document.createElement("div");
                col.className = "col-12 mb-3";

                const card = document.createElement("div");
                card.className = "card";
                card.title = `${productData.title} - ${productData.cost}`;

                const cardBody = document.createElement("div");
                cardBody.className = "card-body d-flex align-items-center";

                const imgElement = document.createElement("img");
                if (Array.isArray(productData.mainimagepath)) {
                    const byteArray = new Uint8Array(productData.mainimagepath);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    const imageUrl = URL.createObjectURL(blob);
                    imgElement.src = imageUrl;
                } else {
                    imgElement.src = productData.mainimagepath;
                }
                imgElement.className = "card-img-top me-3";
                imgElement.style.width = "100px";

                const titleElement = document.createElement("h5");
                titleElement.className = "card-title";
                titleElement.textContent = productData.title;

                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.innerHTML = "X";
                deleteButton.style.position = "absolute";
                deleteButton.style.top = "10px";
                deleteButton.style.right = "10px";
                deleteButton.style.opacity = "0.7";
                deleteButton.style.backgroundColor = "transparent";
                deleteButton.style.border = "none";
                deleteButton.style.cursor = "pointer";

                deleteButton.addEventListener('click', function() {
                    const isConfirmed = confirm("Вы уверены, что хотите удалить этот связанный товар?");
                    if (isConfirmed) {
                        card.remove();
                        attachedProductsList = attachedProductsList.filter(id => id !== productId);
                        console.log("Выбранные связанные товары:", attachedProductsList);
                    }
                });

                cardBody.appendChild(imgElement);
                cardBody.appendChild(titleElement);
                cardBody.appendChild(deleteButton);
                card.appendChild(cardBody);
                col.appendChild(card);
                attachedProductsGrid.appendChild(col);
            }
        }).catch(error => console.error("Ошибка при получении прикрепленного продукта:", error));
    });

    // Добавляем кнопку "+" обратно после обновления списка связанных товаров
    const addButtonContainer = document.createElement("div");
    addButtonContainer.style.display = "grid";
    addButtonContainer.style.placeItems = "center"; // Центрируем содержимое по центру грида
    addButtonContainer.style.margin = "20px 0";

    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.innerHTML = "+"; 
    addButton.style.borderRadius = "50%";
    addButton.style.width = "40px";
    addButton.style.height = "40px";
    addButton.style.display = "flex";
    addButton.style.alignItems = "center";
    addButton.style.justifyContent = "center";
    addButton.style.fontSize = "24px";
    addButton.style.marginLeft = "190px";
    addButton.style.marginBottom = "20px";

    addButton.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';

        // Удаляем кнопку "+" из DOM перед открытием попапа
        addButton.remove();

        // Загружаем все товары и отображаем только активные товары в попапе
        getAllProducts().then(products => {
            const activeProducts = products.filter(product => product.isactive && product.id !== id);

            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = ''; // Очищаем предыдущие данные

            activeProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = product.id;

                const imgElement = document.createElement('img');
                if (Array.isArray(product.mainimagepath)) {
                    const byteArray = new Uint8Array(product.mainimagepath);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    const imageUrl = URL.createObjectURL(blob);
                    imgElement.src = imageUrl;
                } else {
                    imgElement.src = product.mainimagepath;
                }
                imgElement.alt = product.title;

                const titleElement = document.createElement('h5');
                titleElement.textContent = product.title;

                card.appendChild(imgElement);
                card.appendChild(titleElement);
                productsGrid.appendChild(card);

                // Обработчик события для выбора товара
                card.addEventListener('click', function() {
                    const productId = this.dataset.id;
                    attachedProductsList.push(productId);
                    console.log("Выбранные связанные товары:", attachedProductsList);
                    updateAttachedProductsGrid();
                });
            });
        });
    });

    attachedProductsGrid.appendChild(addButtonContainer);
    addButtonContainer.appendChild(addButton);
}

// Обработчик события для кнопки "Сохранить изменения"
document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    const submitButton = event.target;
    submitButton.disabled = true; // Блокируем кнопку

    const costInput = document.getElementById("cost").value;
    const cost = parseFloat(costInput);

    if (isNaN(cost) || cost <= 0) {
        alert("Цена должна быть числом больше нуля. Пожалуйста, введите корректную цену.");
        submitButton.disabled = false; // Разблокируем кнопку
        return;
    }

    const updatedData = {
        title: document.getElementById("title").value,
        cost: cost,
        description: document.getElementById("description").value,
        manufacturerid: document.getElementById("manufacturer").value,
        isactive: document.getElementById("isactive").value === "true",
    };

    const mainimagepathInput = document.getElementById("mainimagepath");
    const file = mainimagepathInput.files[0];

    if (file) {
        // Если файл был выбран, преобразуем его в ArrayBuffer
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);
            const fileData = Array.from(byteArray);

            updatedData.mainimagepath = fileData;

            if (id) {
                // Если есть id, обновляем существующий продукт
                updateProduct(id, updatedData)
                    .then(response => {
                        console.log("Товар успешно обновлен:", response);
                        saveAttachedProducts(id);
                    })
                    .catch(error => {
                        console.error("Ошибка при обновлении товара:", error);
                    })
                    .finally(() => {
                        submitButton.disabled = false; // Разблокируем кнопку
                        window.location.href = "index.html";
                    });
            } else {
                // Если нет id, создаем новый продукт
                createProducts(updatedData)
                    .then(response => {
                        console.log("Товар успешно создан:", response);
                        saveAttachedProducts(response.id);
                    })
                    .catch(error => {
                        console.error("Ошибка при создании товара:", error);
                    })
                    .finally(() => {
                        submitButton.disabled = false; // Разблокируем кнопку
                        window.location.href = "index.html";
                    });
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (product && product.mainimagepath) {
        // Если файл не был выбран, но у товара была фотография, сохраняем имеющееся значение
        updatedData.mainimagepath = product.mainimagepath;

        if (id) {
            // Если есть id, обновляем существующий продукт
            updateProduct(id, updatedData)
                .then(response => {
                    console.log("Товар успешно обновлен:", response);
                    saveAttachedProducts(id);
                })
                .catch(error => {
                    console.error("Ошибка при обновлении товара:", error);
                })
                .finally(() => {
                    submitButton.disabled = false; // Разблокируем кнопку
                    window.location.href = "index.html";
                });
        } else {
            // Если нет id, создаем новый продукт
            createProducts(updatedData)
                .then(response => {
                    console.log("Товар успешно создан:", response);
                    saveAttachedProducts(response.id);
                })
                .catch(error => {
                    console.error("Ошибка при создании товара:", error);
                })
                .finally(() => {
                    submitButton.disabled = false; // Разблокируем кнопку
                    window.location.href = "index.html";
                });
        }
    } else {
        // Если файл не был выбран и у товара не было фотографии, ничего не делаем
        if (id) {
            updatedData.mainimagepath = "ServiceProducts\\nophoto.png";

            // Если есть id, обновляем существующий продукт
            updateProduct(id, updatedData)
                .then(response => {
                    console.log("Товар успешно обновлен:", response);
                    saveAttachedProducts(id);
                })
                .catch(error => {
                    console.error("Ошибка при обновлении товара:", error);
                })
                .finally(() => {
                    submitButton.disabled = false; // Разблокируем кнопку
                    window.location.href = "index.html";
                });
        } else {
            updatedData.mainimagepath = "ServiceProducts\\nophoto.png";

            // Если нет id, создаем новый продукт
            createProducts(updatedData)
                .then(response => {
                    console.log("Товар успешно создан:", response);
                    saveAttachedProducts(response.id);
                })
                .catch(error => {
                    console.error("Ошибка при создании товара:", error);
                })
                .finally(() => {
                    submitButton.disabled = false; // Разблокируем кнопку
                    window.location.href = "index.html";
                });
        }
    }
});

function saveAttachedProducts(mainProductId) {
    // Удаляем дубликаты из attachedProductsList
    const uniqueAttachedProductsList = Array.from(new Set(attachedProductsList));

    uniqueAttachedProductsList.forEach(productId => {
        const attachedProduct = {
            mainproductid: mainProductId,
            attachedproductid: productId
        };
        createAttachedProduct(attachedProduct)
            .then(response => {
                console.log("Товар успешно прикреплен:", response);
            })
            .catch(error => {
                console.error("Ошибка при прикреплении товара:", error);
            });
    });
}

// Обработчик события для закрытия попапа
document.querySelector('.close').addEventListener('click', function() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';

    // Добавляем кнопку "+" обратно после закрытия попапа
    const attachedProductsGrid = document.getElementById("attachedProductsGrid");
    const addButtonContainer = document.createElement("div");
    addButtonContainer.style.display = "grid";
    addButtonContainer.style.placeItems = "center"; // Центрируем содержимое по центру грида
    addButtonContainer.style.margin = "20px 0";

    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.innerHTML = "+"; // Символ "+"
    addButton.style.borderRadius = "50%";
    addButton.style.width = "40px";
    addButton.style.height = "40px";
    addButton.style.display = "flex";
    addButton.style.alignItems = "center";
    addButton.style.justifyContent = "center";
    addButton.style.fontSize = "24px";
    addButton.style.marginLeft = "190px";
    addButton.style.marginBottom = "20px";

    addButton.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';

        // Удаляем кнопку "+" из DOM перед открытием попапа
        addButton.remove();

        // Загружаем все товары и отображаем только активные товары в попапе
        getAllProducts().then(products => {
            const activeProducts = products.filter(product => product.isactive && product.id !== id);

            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = ''; // Очищаем предыдущие данные

            activeProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = product.id;

                const imgElement = document.createElement('img');
                if (Array.isArray(product.mainimagepath)) {
                    const byteArray = new Uint8Array(product.mainimagepath);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    const imageUrl = URL.createObjectURL(blob);
                    imgElement.src = imageUrl;
                } else {
                    imgElement.src = product.mainimagepath;
                }
                imgElement.alt = product.title;

                const titleElement = document.createElement('h5');
                titleElement.textContent = product.title;

                card.appendChild(imgElement);
                card.appendChild(titleElement);
                productsGrid.appendChild(card);

                // Обработчик события для выбора товара
                card.addEventListener('click', function() {
                    const productId = this.dataset.id;
                    attachedProductsList.push(productId);
                    console.log("Выбранные связанные товары:", attachedProductsList);
                    updateAttachedProductsGrid();
                });
            });
        });
    });

    attachedProductsGrid.appendChild(addButtonContainer);
});