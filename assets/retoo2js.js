// Para acceder a los elementos del HTML ya no usamos document.getElementById —
// usamos document.querySelector, que acepta cualquier selector CSS (#id, .clase,
// etiqueta...) y no solo ids.

async function obtenerPersonajes() {
  const respuesta = await fetch("https://rickandmortyapi.com/api/character");
  const datos = await respuesta.json();
  return datos.results;
}

function filtrarPorEstado(personajes, estado) {
  if (estado === "") return personajes;
  return personajes.filter(function (personaje) {
    return personaje.status.toLowerCase() === estado;
  });
}

function filtrarPorEspecie(personajes, especie) {
  if (especie === "") return personajes;
  return personajes.filter(function (personaje) {
    return personaje.species === especie;
  });
}

function calcularEstadisticas(lista) {
  return lista.reduce(
    function (acumulado, personaje) {
      if (personaje.status === "Alive") acumulado.vivos++;
      else if (personaje.status === "Dead") acumulado.muertos++;
      else acumulado.desconocidos++;
      return acumulado;
    },
    { vivos: 0, muertos: 0, desconocidos: 0 }
  );
}

let personajes = [];
let ordenarAZ = false;
let soloPrimeros10 = false;

function aplicarFiltros() {
  const nombre = document.querySelector("#filtro-nombre").value.trim().toLowerCase();
  const estado = document.querySelector("#filtro-estado").value;
  const especie = document.querySelector("#filtro-especie").value;

  let filtrados = filtrarPorEstado(personajes, estado);
  filtrados = filtrarPorEspecie(filtrados, especie);
  filtrados = filtrados.filter(function (personaje) {
    return personaje.name.toLowerCase().includes(nombre);
  });

  if (ordenarAZ) {
    filtrados = filtrados.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  // Coincidencia exacta y su posición (find + map + indexOf)
  let coincidenciaExacta = null;
  let posicionExacta = -1;
  if (nombre !== "") {
    coincidenciaExacta = filtrados.find(function (p) {
      return p.name.toLowerCase() === nombre;
    });
    if (coincidenciaExacta) {
      const nombres = filtrados.map(function (p) {
        return p.name;
      });
      posicionExacta = nombres.indexOf(coincidenciaExacta.name);
    }
  }

  if (soloPrimeros10) {
    filtrados = filtrados.slice(0, 10);
  }

  pintarResultados(filtrados, coincidenciaExacta, posicionExacta);
}

function pintarResultados(lista, coincidenciaExacta, posicionExacta) {
  const contenedor = document.querySelector("#resultados");
  document.querySelector("#contador").textContent = lista.length + " personajes encontrados";

  const stats = calcularEstadisticas(lista);
  const hayMuertos = lista.some(function (p) {
    return p.status === "Dead";
  });
  const todosVivos = lista.every(function (p) {
    return p.status === "Alive";
  });

  let textoStats =
    stats.vivos + " vivos · " + stats.muertos + " muertos · " + stats.desconocidos + " desconocidos";

  if (hayMuertos) {
    textoStats += " (Hay muertos en el resultado)";
  }
  if (todosVivos && lista.length > 0) {
    textoStats += " (Todos están vivos)";
  }
  if (coincidenciaExacta && posicionExacta !== -1) {
    textoStats += " · Coincidencia exacta: " + coincidenciaExacta.name + " (posición #" + (posicionExacta + 1) + ")";
  }

  document.querySelector("#estadisticas").textContent = textoStats;

  contenedor.innerHTML = lista
    .map(function (personaje, indice) {
      return (
        '<article class="personaje-card">' +
        '<span class="numero">#' + (indice + 1) + "</span>" +
        '<img src="' + personaje.image + '" alt="' + personaje.name + '" />' +
        "<h3>" + personaje.name + "</h3>" +
        "<p>" + personaje.status + " · " + personaje.species + "</p>" +
        "</article>"
      );
    })
    .join("");
}

document.querySelector("#filtro-nombre").addEventListener("input", aplicarFiltros);
document.querySelector("#filtro-estado").addEventListener("change", aplicarFiltros);
document.querySelector("#filtro-especie").addEventListener("change", aplicarFiltros);

document.querySelector("#btn-orden").addEventListener("click", function () {
  ordenarAZ = !ordenarAZ;
  aplicarFiltros();
});

document.querySelector("#check-primeros10").addEventListener("change", function (evento) {
  soloPrimeros10 = evento.target.checked;
  aplicarFiltros();
});

document.querySelector("#btn-limpiar").addEventListener("click", function () {
  document.querySelector("#filtro-nombre").value = "";
  document.querySelector("#filtro-estado").value = "";
  document.querySelector("#filtro-especie").value = "";

  ordenarAZ = false;
  soloPrimeros10 = false;
  document.querySelector("#check-primeros10").checked = false;

  aplicarFiltros();
});

obtenerPersonajes().then(function (datos) {
  personajes = datos;
  aplicarFiltros();
});