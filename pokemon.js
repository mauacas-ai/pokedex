const boton = document.getElementById("botonPokemon");
const resultado = document.getElementById("resultado");

const tiposES = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};

const regiones = {
    1: "Kanto",
    2: "Johto",
    3: "Hoenn",
    4: "Sinnoh",
    5: "Teselia",
    6: "Kalos",
    7: "Alola",
    8: "Galar",
    9: "Paldea"
};

/* 
   Coordenadas aproximadas de la inspiración
   REAL de cada región Pokémon
*/
const ubicacionesRegiones = {

    Kanto: {
        lugar: "Región de Kanto, Japón",
        lat: 35.68,
        lng: 139.76,
        zoom: 6
    },

    Johto: {
        lugar: "Región de Kansai, Japón",
        lat: 34.69,
        lng: 135.50,
        zoom: 6
    },

    Hoenn: {
        lugar: "Isla de Kyushu, Japón",
        lat: 32.75,
        lng: 130.70,
        zoom: 6
    },

    Sinnoh: {
        lugar: "Isla de Hokkaido, Japón",
        lat: 43.06,
        lng: 141.35,
        zoom: 6
    },

    Teselia: {
        lugar: "Nueva York, Estados Unidos",
        lat: 40.71,
        lng: -74.00,
        zoom: 5
    },

    Kalos: {
        lugar: "Francia",
        lat: 46.60,
        lng: 2.20,
        zoom: 5
    },

    Alola: {
        lugar: "Hawái, Estados Unidos",
        lat: 20.80,
        lng: -156.30,
        zoom: 6
    },

    Galar: {
        lugar: "Reino Unido",
        lat: 54.70,
        lng: -3.50,
        zoom: 5
    },

    Paldea: {
        lugar: "España y Portugal",
        lat: 40.20,
        lng: -3.70,
        zoom: 5
    }
};

const coloresTipo = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};


// ================================
// GENERAR POKÉMON
// ================================

async function obtenerPokemon() {

    resultado.innerHTML = `
        <div class="text-white-50 py-4">
            Cargando Pokémon...
        </div>
    `;

    try {

        const numero = Math.floor(Math.random() * 1025) + 1;

        const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${numero}`
        );

        const pokemon = await pokemonResponse.json();

        const speciesResponse = await fetch(
            pokemon.species.url
        );

        const species = await speciesResponse.json();

        const debilidades = await obtenerDebilidades(
            pokemon.types
        );

        const counters = await obtenerCounters(
            debilidades
        );

        mostrarPokemon(
            pokemon,
            species,
            debilidades,
            counters
        );

    } catch (error) {

        console.error(error);

        resultado.innerHTML = `
            <div class="alert alert-danger">
                No se pudo cargar el Pokémon.
            </div>
        `;
    }
}


// ================================
// DEBILIDADES
// ================================

async function obtenerDebilidades(tiposPokemon) {

    const multiplicadores = {};

    Object.keys(tiposES).forEach(tipo => {
        multiplicadores[tipo] = 1;
    });

    for (const tipoPokemon of tiposPokemon) {

        const response = await fetch(
            tipoPokemon.type.url
        );

        const datosTipo = await response.json();

        const relaciones = datosTipo.damage_relations;

        relaciones.double_damage_from.forEach(tipo => {
            multiplicadores[tipo.name] *= 2;
        });

        relaciones.half_damage_from.forEach(tipo => {
            multiplicadores[tipo.name] *= 0.5;
        });

        relaciones.no_damage_from.forEach(tipo => {
            multiplicadores[tipo.name] = 0;
        });
    }

    return Object.entries(multiplicadores)
        .filter(([tipo, valor]) => valor >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([tipo, valor]) => ({
            tipo,
            multiplicador: valor
        }));
}


// ================================
// COUNTERS
// ================================

async function obtenerCounters(debilidades) {

    const counters = [];

    const tiposCounter = debilidades
        .slice(0, 3)
        .map(item => item.tipo);

    for (const tipo of tiposCounter) {

        try {

            const response = await fetch(
                `https://pokeapi.co/api/v2/type/${tipo}`
            );

            const datos = await response.json();

            const lista = datos.pokemon;

            const seleccionados = lista
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);

            seleccionados.forEach(item => {

                const nombre = item.pokemon.name;

                if (!counters.includes(nombre)) {
                    counters.push(nombre);
                }

            });

        } catch (error) {

            console.error(
                "Error obteniendo counters:",
                error
            );
        }
    }

    return counters.slice(0, 5);
}


// ================================
// RAREZA
// ================================

function obtenerRareza(species) {

    if (species.is_mythical) {
        return "Mítico";
    }

    if (species.is_legendary) {
        return "Legendario";
    }

    const captura = species.capture_rate;

    if (captura <= 45) {
        return "Raro";
    }

    if (captura <= 120) {
        return "Poco común";
    }

    return "Común";
}


// ================================
// REGIÓN
// ================================

function obtenerRegion(species) {

    const generacion =
        species.generation.name
            .replace("generation-", "");

    return regiones[
        parseInt(generacion)
    ] || "Desconocida";
}


// ================================
// TEXTO
// ================================

function capitalizar(texto) {

    return texto
        .charAt(0)
        .toUpperCase() +
        texto.slice(1);
}


// ================================
// TIPOS
// ================================

function crearTipos(tipos) {

    return tipos.map(item => {

        const tipo = item.type.name;

        return `
            <span
                class="type-badge"
                style="background:${coloresTipo[tipo]}"
            >
                ${tiposES[tipo]}
            </span>
        `;

    }).join("");
}


// ================================
// DEBILIDADES HTML
// ================================

function crearDebilidades(debilidades) {

    if (debilidades.length === 0) {

        return `
            <span class="text-white-50">
                Ninguna
            </span>
        `;
    }

    return debilidades.map(item => {

        const multiplicador =
            item.multiplicador === 4
                ? "×4"
                : "×2";

        return `
            <span class="weakness">
                ${tiposES[item.tipo]} ${multiplicador}
            </span>
        `;

    }).join("");
}


// ================================
// COUNTERS HTML
// ================================

function crearCounters(counters) {

    if (counters.length === 0) {

        return `
            <span class="text-white-50">
                No disponibles
            </span>
        `;
    }

    return counters.map(nombre => {

        return `
            <span class="counter">
                ${capitalizar(nombre)}
            </span>
        `;

    }).join("");
}


// ================================
// ESTADÍSTICAS
// ================================

function crearEstadisticas(stats) {

    const nombres = {

        hp: "HP",
        attack: "Ataque",
        defense: "Defensa",
        "special-attack": "At. Esp.",
        "special-defense": "Def. Esp.",
        speed: "Velocidad"

    };

    return stats.map(stat => {

        const nombre =
            nombres[stat.stat.name];

        const valor =
            stat.base_stat;

        const porcentaje =
            Math.min(
                (valor / 180) * 100,
                100
            );

        return `

            <div class="stat-row">

                <div class="d-flex align-items-center">

                    <span class="stat-label">
                        ${nombre}
                    </span>

                    <div class="progress flex-grow-1">

                        <div
                            class="progress-bar"
                            style="width:${porcentaje}%"
                        ></div>

                    </div>

                    <span class="ms-2 fw-bold">
                        ${valor}
                    </span>

                </div>

            </div>

        `;

    }).join("");
}


// ================================
// MAPA
// ================================

function crearMapa(region) {

    const ubicacion =
        ubicacionesRegiones[region];

    if (!ubicacion) {

        return `
            <div class="text-white-50">
                Ubicación no disponible
            </div>
        `;
    }

    return `

        <div class="mt-4">

            <div class="map-title">
                🌎 Ubicación en el mundo real
            </div>

            <div id="mapa"></div>

            <div class="text-white-50 mt-2"
                 style="font-size:0.75rem;">
                Inspiración geográfica:
                ${ubicacion.lugar}
            </div>

        </div>

    `;
}


// ================================
// MOSTRAR POKÉMON
// ================================

function mostrarPokemon(
    pokemon,
    species,
    debilidades,
    counters
) {

    const nombre =
        capitalizar(pokemon.name);

    const region =
        obtenerRegion(species);

    const rareza =
        obtenerRareza(species);

    const tipos =
        crearTipos(pokemon.types);

    const debilidadesHTML =
        crearDebilidades(debilidades);

    const countersHTML =
        crearCounters(counters);

    const habilidades =
        pokemon.abilities
            .map(habilidad =>
                capitalizar(
                    habilidad.ability.name
                        .replaceAll("-", " ")
                )
            )
            .join(", ");

    const imagen =
        pokemon.sprites.other[
            "official-artwork"
        ].front_default;

    const peso =
        pokemon.weight / 10;

    const altura =
        pokemon.height / 10;


    resultado.innerHTML = `

        <div class="poke-card text-white w-100">

            <div class="text-start mb-2">

                <span
                    style="
                    background:#08090d;
                    padding:7px 14px;
                    border-radius:20px;
                    font-weight:700;
                    "
                >
                    #${pokemon.id}
                </span>

            </div>


            <img
                src="${imagen}"
                alt="${nombre}"
                class="poke-img img-fluid"
            >


            <h1 class="fw-bold mt-2 mb-2">
                ${nombre}
            </h1>


            <div class="mb-3">
                ${tipos}
            </div>


            <div class="row g-2 mb-3">

                <div class="col-6">

                    <div class="info-box">

                        <div class="info-title">
                            🌎 Región
                        </div>

                        <div class="info-value">
                            ${region}
                        </div>

                    </div>

                </div>


                <div class="col-6">

                    <div class="info-box">

                        <div class="info-title">
                            ⭐ Rareza
                        </div>

                        <div class="info-value">

                            <span class="rarity">
                                ${rareza}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            <div
                class="row mb-3"
                style="
                background:#050505;
                border-radius:10px;
                padding:10px;
                "
            >

                <div class="col-6 border-end">

                    <div class="text-white-50">
                        Peso
                    </div>

                    <strong>
                        ${peso.toFixed(1)} kg
                    </strong>

                </div>


                <div class="col-6">

                    <div class="text-white-50">
                        Altura
                    </div>

                    <strong>
                        ${altura.toFixed(1)} m
                    </strong>

                </div>

            </div>


            <div class="mb-4">

                <span class="text-white-50 fw-bold">
                    Habilidades:
                </span>

                <span class="fw-semibold">
                    ${habilidades}
                </span>

            </div>


            <div class="text-start mb-3">

                <div class="section-title">
                    ⚔️ Debilidades
                </div>

                <div>
                    ${debilidadesHTML}
                </div>

            </div>


            <div class="text-start mb-4">

                <div class="section-title">
                    🛡️ Counters
                </div>

                <div>
                    ${countersHTML}
                </div>

            </div>


            <div class="text-start">

                <div class="section-title">
                    📊 Estadísticas
                </div>

                ${crearEstadisticas(
                    pokemon.stats
                )}

            </div>


            <!-- MAPA -->

            ${crearMapa(region)}

        </div>

    `;


    // Crear mapa después de insertar el HTML
    crearMapaLeaflet(region);
}


// ================================
// LEAFLET
// ================================

function crearMapaLeaflet(region) {

    const ubicacion =
        ubicacionesRegiones[region];

    if (!ubicacion) {
        return;
    }

    const mapa =
        L.map("mapa").setView(
            [
                ubicacion.lat,
                ubicacion.lng
            ],
            ubicacion.zoom
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(mapa);


    L.marker([
        ubicacion.lat,
        ubicacion.lng
    ])
        .addTo(mapa)
        .bindPopup(`
            <b>${region}</b><br>
            ${ubicacion.lugar}
        `)
        .openPopup();
}


// ================================
// BOTÓN
// ================================

boton.addEventListener(
    "click",
    obtenerPokemon
);


// Pokémon inicial
obtenerPokemon();