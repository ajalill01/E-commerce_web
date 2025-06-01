document.addEventListener('DOMContentLoaded', async () => {
  const brandSelect = document.getElementById('productBrand');
  const carSelect = document.getElementById('productCar');

  try {
    const response = await fetch('http://localhost:3000/api/brands/get');
    const brands = await response.json();
    
    brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
    brands.forEach(brand => {
      brandSelect.innerHTML += `<option value="${brand._id}">${brand.name}</option>`;
    });
  } catch (err) {
    console.error("Failed to load brands:", err);
  }

  brandSelect.addEventListener('change', async (e) => {
    const brandId = e.target.value;
    carSelect.disabled = !brandId;
    
    if (brandId) {
      try {
        const response = await fetch(`http://localhost:3000/api/cars/get?brandId=${brandId}`);
        const cars = await response.json();
        
        carSelect.innerHTML = '<option value="">-- Select Model --</option>';
        cars.forEach(car => {
          carSelect.innerHTML += `<option value="${car._id}">${car.model}</option>`;
        });
      } catch (err) {
        console.error("Failed to load cars:", err);
      }
    }
  });

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
     
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('carId', document.getElementById('productCar').value);
    formData.append('description', 'Sample description'); 
    formData.append('price', '100'); 
    
    const files = document.getElementById('productImages').files;
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const response = await fetch('http://localhost:3000/api/products/add', {
        method: 'POST',
        body: formData,
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const result = await response.json();
      if (response.ok) {
        alert('Product added successfully!');

      } else {
        throw new Error(result.error || 'Failed to add product');
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.message);
    }
  });
});