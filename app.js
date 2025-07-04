let libros = JSON.parse(localStorage.getItem('libros')) || [];
let editando = false;
let libroEditadoId = null;
let ordenAscendente = true;

const formulario = document.getElementById('formulario');
const tablaLibros = document.getElementById('tabla-libros');
const busquedaInput = document.getElementById('busqueda');
const filtroGenero = document.getElementById('filtro-genero');
const ordenarBtn = document.getElementById('ordenar');

formulario.addEventListener('submit', guardarLibro);
busquedaInput.addEventListener('input', mostrarLibros);
filtroGenero.addEventListener('change', mostrarLibros);
ordenarBtn.addEventListener('click', () => {
  ordenAscendente = !ordenAscendente;
  mostrarLibros();
});

function guardarLibro(e) {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const autor = document.getElementById('autor').value.trim();
  const anio = parseInt(document.getElementById('anio').value);
  const genero = document.getElementById('genero').value;

  if (!titulo || !autor || !anio || !genero) {
    alert("Todos los campos son obligatorios");
    return;
  }

  const anioActual = new Date().getFullYear();
  if (anio < 1900 || anio > anioActual) {
    alert("El año debe estar entre 1900 y " + anioActual);
    return;
  }

  const duplicado = libros.some((libro, i) => {
    return (
      libro.titulo.toLowerCase() === titulo.toLowerCase() &&
      libro.autor.toLowerCase() === autor.toLowerCase() &&
      (!editando || i !== libroEditadoId)
    );
  });

  if (duplicado) {
    alert("Ya existe un libro con ese título y autor");
    return;
  }

  const libro = { titulo, autor, anio, genero };

  if (editando) {
    libros[libroEditadoId] = libro;
    editando = false;
    libroEditadoId = null;
  } else {
    libros.push(libro);
  }

  formulario.reset();
  guardarEnStorage();
  mostrarLibros();
}

function guardarEnStorage() {
  localStorage.setItem('libros', JSON.stringify(libros));
}

function mostrarLibros() {
  const filtroTexto = busquedaInput.value.toLowerCase();
  const generoSeleccionado = filtroGenero.value;

  let filtrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(filtroTexto) &&
    (generoSeleccionado === "" || libro.genero === generoSeleccionado)
  );

  
  filtrados.sort((a, b) => {
    return ordenAscendente ? a.anio - b.anio : b.anio - a.anio;
  });

  //render
  tablaLibros.innerHTML = "";

  filtrados.forEach((libro, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.anio}</td>
      <td>${libro.genero}</td>
      <td>
        <button class="editar" onclick="editarLibro(${index})">Editar</button>
        <button class="eliminar" onclick="eliminarLibro(${index})">Eliminar</button>
      </td>
    `;
    tablaLibros.appendChild(fila);
  });

  actualizarFiltroGeneros();
  mostrarEstadisticas();
}

function editarLibro(index) {
  const libro = libros[index];
  document.getElementById('titulo').value = libro.titulo;
  document.getElementById('autor').value = libro.autor;
  document.getElementById('anio').value = libro.anio;
  document.getElementById('genero').value = libro.genero;

  editando = true;
  libroEditadoId = index;
}

function eliminarLibro(index) {
  if (confirm("¿Estás seguro de eliminar este libro?")) {
    libros.splice(index, 1);
    guardarEnStorage();
    mostrarLibros();
  }
}

function actualizarFiltroGeneros() {
  const generosUnicos = [...new Set(libros.map(libro => libro.genero))];
  filtroGenero.innerHTML = '<option value="">Todos</option>';
  generosUnicos.forEach(genero => {
    const opcion = document.createElement('option');
    opcion.value = genero;
    opcion.textContent = genero;
    filtroGenero.appendChild(opcion);
  });
}

function mostrarEstadisticas() {
  const total = libros.length;
  const spanTotal = document.getElementById('total');
  const spanPromedio = document.getElementById('promedio');
  const spanPosteriores = document.getElementById('posteriores');
  const spanAntiguo = document.getElementById('antiguo');
  const spanReciente = document.getElementById('reciente');

  spanTotal.textContent = total;

  if (total > 0) {
    const sumaAnios = libros.reduce((sum, libro) => sum + libro.anio, 0);
    const promedio = Math.round(sumaAnios / total);
    spanPromedio.textContent = promedio;

    const posteriores = libros.filter(libro => libro.anio > 2010).length;
    spanPosteriores.textContent = posteriores;

    const antiguo = libros.reduce((a, b) => (a.anio < b.anio ? a : b));
    const reciente = libros.reduce((a, b) => (a.anio > b.anio ? a : b));

    spanAntiguo.textContent = `${antiguo.titulo} (${antiguo.anio})`;
    spanReciente.textContent = `${reciente.titulo} (${reciente.anio})`;
  } else {
    spanPromedio.textContent = "-";
    spanPosteriores.textContent = "-";
    spanAntiguo.textContent = "-";
    spanReciente.textContent = "-";
  }
}

mostrarLibros();
