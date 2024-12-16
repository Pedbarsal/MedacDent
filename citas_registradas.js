document.addEventListener("DOMContentLoaded", inicializarTabla);

// Inicializar la tabla
function inicializarTabla() {
    const citas = obtenerCitas();
    const tabla = document.getElementById("tabla_citas").getElementsByTagName("tbody")[0];
    let filaVacia = document.getElementById("fila-vacia");

    // En caso de no existir la fila vacía
    if (!filaVacia) {
        filaVacia = document.createElement("tr");
        filaVacia.id = "fila-vacia";
        filaVacia.innerHTML = "<td colspan='8'>No hay citas registradas.</td>";
        tabla.appendChild(filaVacia);
    }

    // Limpiar las filas existentes en la tabla, excepto la fila vacía
    const filas = Array.from(tabla.getElementsByTagName("tr"));
    filas.forEach((fila, indice) => {
        if (indice > 0) {
            fila.remove();
        }
    });

    // Mostrar los datos de las citas 
    if (citas.length === 0) {
        mostrarFilaVacia(filaVacia);
    } else {
        ocultarFilaVacia(filaVacia);
        mostrarCitas(tabla, citas);
    }
}

// Obtener las citas guardadas en LocalStorage
function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citas") || "[]");
}

// Mostrar la fila que indica que no hay citas registradas
function mostrarFilaVacia(filaVacia) {
    filaVacia.style.display = "table-row"; // Mostrar que no hay citas registradas
}

// Ocultar la fila que indica que no hay citas registradas
function ocultarFilaVacia(filaVacia) {
    filaVacia.style.display = "none"; // Ocultar 
}

// Mostrar las citas registradas en la tabla
function mostrarCitas(tabla, citas) {
    citas.forEach((cita, indice) => {
        const fila = tabla.insertRow(); // Crear nueva fila
        añadirCita(fila, indice, cita); // Añadir los datos de la cita a la nueva fila
    });

    // Delegación de eventos en la tabla
    const tablaCitas = document.getElementById("tabla_citas");
    tablaCitas.addEventListener("click", function (event) {
        const target = event.target;

        // Verificar si el clic fue en un botón de eliminar
        if (target.classList.contains("eliminar")) {
            const id = target.dataset.id;

            // Añadir ventana de confirmación
            const confirmado = confirm("¿Está seguro de que desea eliminar esta cita?");
            if (confirmado) {
                eliminarCita(id, target); // Eliminar cita
            }
        }

        // Verificar si el clic fue en un botón de modificar
        if (target.classList.contains("modificar")) {
            const id = target.dataset.id;

            // Añadir ventana de confirmación
            const confirmado = confirm("¿Está seguro de que desea modificar esta cita?");
            if (confirmado) {
                modificarCita(id, target); // Modificar cita
            }
        }
    });
}

// Eliminar cita
function eliminarCita(id, botonEliminar) {
    // Obtener todas las citas guardadas en LocalStorage
    let citas = obtenerCitas();

    // Eliminar la cita
    citas = citas.filter(cita => String(cita.id) !== id);

    // Guardar las citas actualizadas en LocalStorage
    guardarCitas(citas);

    // Eliminar la fila correspondiente de la tabla
    const fila = botonEliminar.closest("tr"); // Obtener la fila más cercana al botón eliminar
    fila.remove();

    // Inicializar de nuevo la tabla para actualizar las filas y mostrar la fila vacía si es necesario
    inicializarTabla();
}

// Modificar cita
function modificarCita(id) {
    // Obtener citas de LocalStorage
    const citas = obtenerCitas();

    // Buscar la cita con el id especificado
    const cita = citas.find(cita => cita.id === id);

    // Construir los parámetros en la URL
    if (cita) {
        // Construir los parámetros de la URL
        const params = new URLSearchParams({
            id: cita.id,
            fecha_hora: cita.fecha_hora,
            nombre: cita.paciente.nombre,
            apellidos: cita.paciente.apellidos,
            dni: cita.paciente.dni,
            telefono: cita.paciente.telefono,
            fecha_nacimiento: cita.paciente.fecha_nacimiento,
            observaciones: cita.observaciones || "",
        });

        // Redirigir a la página registrar_cita.html
        window.location.href = `registrar_cita.html?${params.toString()}`;
    }
}

// Guardar las citas en LocalStorage
function guardarCitas(citas) {
    localStorage.setItem("citas", JSON.stringify(citas));
}

// Añadir una nueva cita a la tabla
function añadirCita(fila, indice, cita) {
    // Aplicar formato a la fecha y hora de la cita
    const fechaHora = new Date(cita.fecha_hora);
    const fechaFormateada = fechaHora.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
    const horaFormateada = fechaHora.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Aplicar formato a la fecha de nacimiento
    const fechaNacimiento = new Date(cita.paciente.fecha_nacimiento);
    const fechaNacimientoFormateada = fechaNacimiento.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    // Añadir fila a la tabla
    fila.innerHTML = `
        <td>${indice + 1}</td>
        <td>${fechaFormateada} ${horaFormateada}</td>
        <td>${cita.paciente.nombre}</td>
        <td>${cita.paciente.apellidos}</td>
        <td>${cita.paciente.dni}</td>
        <td>${cita.paciente.telefono}</td>
        <td>${fechaNacimientoFormateada}</td>
        <td>${cita.observaciones || "Sin observaciones"}</td>
        <td>
            <!-- Botones de eliminar y modificar -->
            <button class="eliminar" data-id="${cita.id}">Eliminar</button>
            <button class="modificar" data-id="${cita.id}">Modificar</button>
        </td>
    `;
}
