# 📄 Documentacion de la API para Gas N Ride

## Endpoints

### Lee las compañias que existen en Gas N Ride a través de la colección 'companias'

- # URL: '/companias'
- # Método: 'GET'
- # Descripción: Lee la lista con todas las compañias dentro de la BBDD de FireStore
- # Respuesta exitosa (200): en JSON
#  {
#    "id": "1",
#    "idcompania": 1,
#    "nombre_comp": "ALCAMPO"
#  }
#  ...


### Lee los municipios que existen en Gas N Ride a través de la colección 'municipios'

- # URL: '/municipios'
- # Método: 'GET'
- # Descripción: Lee la lista con todos los municipios dentro de la BBDD de Firestore
- # Respuesta exitosa (200): en JSON
#  {
#    "id": "1",
#    "idmunicipio": 1,
#    "nombre": "Ajalvir",
#    "num_gasolineras": 3,
#    "codigo_Territorial": 29,
#    "imagen_url": "//upload.wikimedia.org/wikipedia/commons/6/6f/Vista_panor%C3%A1mica_de_Ajalvir.jpg"
#  },
#  ...

### Lee los usuarios que existen en Gas N Ride a través de la colección 'usuarios'

- # URL: '/usuarios'
- # Método: 'GET'
- # Descripción: Lee la lista con todos los usuarios dentro de la BBDD de Firestore
- # Respuesta exitosa (200): en JSON
#  {
#    "id": "56s0GdM2nncGp4z0s5wA",
#    "nombreUser": "admin",
#    "passUser": "admin"
#  },
#  ...



### Lee las gasolineras registradas en Gas N Ride desde la colección 'gasolineras'

- # URL: '/gasolineras'
- # Método: 'GET'
- # Descripción: Obtiene todas las gasolineras con su información dentro de la BBDD de Firestore
- # Respuesta exitosa (200): en JSON

#  {
#     "id": "1",
#     "idgasolinera": 1,
#     "nombre_gas": "Gasolinera ALCAMPO 4608",
#     "direccion_gas": "C.C. LA DEHESA, AUTOVIA MADRID-BARCELONA km 34,0, Alcalá de Henares",
#     "coordenadas": "",
#     "idMunicipioFK": 3,
#     "precio_gas95": 1.339,
#     "precio_gas98": 1.562,
#     "precio_diesel": 1.259,
#     "precio_gaslicuado": 0,
#     "idCompaniaFK": 1
#  },
#  ...
  

### Lee los puntos de interés desde la colección 'puntos_interes'

- # URL: '/puntos_interes'
- # Método: 'GET'
- # Descripción: Devuelve una lista de puntos de interés dentro de la BBDD de Firestore
- # Respuesta exitosa (200): en JSON

#  {
#    "id": "1",
#    "idpunto_interes": 1,
#    "nombre": "Catedral Magistral de los Santos Justo y Pastor",
#    "tipo": "Monumento",
#    "descripcion": "La Santa e Insigne Catedral-Magistral...",
#    "url_poi": "https://es.wikipedia.org/wiki/Catedral...",
#    "url_imagen_poi": "//upload.wikimedia.org/...",
#    "idmunicipio_fk": 3
#  },
#  ...