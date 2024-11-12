/********** Fetches **********/
function getAllProducts() {
  return fetch("http://localhost:3000/product")
    .then(response => response.json())
}
    function getAllPhotos(id) {
      return fetch(`http://localhost:3000/productphoto?productid=${id}`)
      .then(response => response.json())
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
function getProductById(id) {
  return fetch(`http://localhost:3000/product/${id}`)
  .then(response => response.json())
}


function createProducts(animalObj) {
  return fetch('http://localhost:3000/product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animalObj),
  })
    .then(response => response.json())
}

function updateDonations(id, donationCount) {
  return fetch(`http://localhost:3000/product/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        donations: donationCount
      }),
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error("Uh oh! something is wrong")
        }
      })
}

function deleteProduct(id) {
  return fetch(`http://localhost:3000/product/${id}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
}


function getAllManufacturers() {
  return fetch("http://localhost:3000/manufacturer")
    .then(response => response.json());
}

function getManufacturerById(id) {
  return fetch(`http://localhost:3000/manufacturer/${id}`)
  .then(response => response.json())
}
