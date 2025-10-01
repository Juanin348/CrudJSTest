// --- Importar Firestore ---
import { db } from './firebase-config.js';
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, orderBy, query
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// --- Variables globales y referencias DOM ---
const gamesGrid = document.getElementById('games-grid');
const adminGamesList = document.getElementById('admin-games-list');
const form = document.getElementById('game-form');
const saveBtn = document.getElementById('save-btn');
const updateBtn = document.getElementById('update-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const adminPanel = document.getElementById('admin-panel');
const adminFab = document.getElementById('admin-toggle');
const adminClose = document.getElementById('admin-close');
const formTitle = document.getElementById('form-title');

let editingProductId = null;
let selectedGames = [];

// --- Renderizado ---
function renderProducts(products) {
  // Renderizar cuadrícula principal
  gamesGrid.innerHTML = '';
  products.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.imagen}" alt="${game.nombre}">
      <div class="game-title">${game.nombre}</div>
      <div class="game-description">${game.descripcion}</div>
      <div class="game-price">$${Number(game.precio).toFixed(2)}</div>
      <button class="select-btn${selectedGames.includes(game.id) ? ' selected' : ''}" data-id="${game.id}">
        ${selectedGames.includes(game.id) ? 'Seleccionado' : 'Seleccionar'}
      </button>
    `;
    card.querySelector('.select-btn').addEventListener('click', () => toggleSelectGame(game.id));
    gamesGrid.appendChild(card);
  });

  // Renderizar lista de administración
  adminGamesList.innerHTML = '';
  if (products.length === 0) {
    adminGamesList.innerHTML = '<div style="color:#aaa;">No hay juegos registrados.</div>';
    return;
  }
  products.forEach(game => {
    const item = document.createElement('div');
    item.className = 'admin-game-item';
    item.innerHTML = `
      <div class="admin-game-title">${game.nombre}</div>
      <div class="admin-game-actions">
        <button class="edit-btn" data-id="${game.id}">Editar</button>
        <button class="delete-btn" data-id="${game.id}">Eliminar</button>
      </div>
    `;
    item.querySelector('.edit-btn').addEventListener('click', () => editProduct(game.id));
    item.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(game.id));
    adminGamesList.appendChild(item);
  });
}

// --- CRUD con Firestore ---
async function loadProducts() {
  try {
    const q = query(collection(db, 'products'), orderBy('nombre'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderProducts(products);
  } catch (err) {
    alert('Error al cargar los juegos: ' + err.message);
  }
}

async function addOrUpdateProduct(e) {
  e.preventDefault();
  const nombre = document.getElementById('game-name').value.trim();
  const imagen = document.getElementById('game-image').value.trim();
  const descripcion = document.getElementById('game-description').value.trim();
  const precio = parseFloat(document.getElementById('game-price').value);
  if (!nombre || !imagen || !descripcion || isNaN(precio)) {
    alert('Por favor, completa todos los campos correctamente.');
    return;
  }
  const productData = { nombre, imagen, descripcion, precio };
  try {
    if (editingProductId) {
      await updateDoc(doc(db, 'products', editingProductId), productData);
      alert('Juego actualizado correctamente.');
    } else {
      await addDoc(collection(db, 'products'), productData);
      alert('Juego agregado correctamente.');
    }
    resetForm();
    await loadProducts();
  } catch (err) {
    alert('Error al guardar el juego: ' + err.message);
  }
}

async function editProduct(id) {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      alert('El juego no existe.');
      return;
    }
    const game = docSnap.data();
    document.getElementById('game-id').value = id;
    document.getElementById('game-name').value = game.nombre;
    document.getElementById('game-image').value = game.imagen;
    document.getElementById('game-description').value = game.descripcion;
    document.getElementById('game-price').value = game.precio;
    editingProductId = id;
    formTitle.textContent = 'Editar Juego';
    saveBtn.classList.add('hidden');
    updateBtn.classList.remove('hidden');
    cancelEditBtn.classList.remove('hidden');
  } catch (err) {
    alert('Error al cargar el juego: ' + err.message);
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Seguro que deseas eliminar este juego?')) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    alert('Juego eliminado correctamente.');
    await loadProducts();
    resetForm();
  } catch (err) {
    alert('Error al eliminar el juego: ' + err.message);
  }
}

// --- Selección de Producto (solo visual/local) ---
function toggleSelectGame(id) {
  const idx = selectedGames.indexOf(id);
  if (idx === -1) {
    selectedGames.push(id);
  } else {
    selectedGames.splice(idx, 1);
  }
  // Recargar solo la cuadrícula visual
  loadProducts();
}

// --- Formulario ---
function resetForm() {
  form.reset();
  document.getElementById('game-id').value = '';
  editingProductId = null;
  formTitle.textContent = 'Crear Nuevo Juego';
  saveBtn.classList.remove('hidden');
  updateBtn.classList.add('hidden');
  cancelEditBtn.classList.add('hidden');
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  adminFab.addEventListener('click', () => {
    adminPanel.classList.remove('hidden');
  });
  adminClose.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    resetForm();
  });

  form.addEventListener('submit', addOrUpdateProduct);
  updateBtn.addEventListener('click', addOrUpdateProduct);
  cancelEditBtn.addEventListener('click', resetForm);
}); 