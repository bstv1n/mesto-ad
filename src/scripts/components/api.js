const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "8dc34344-2b36-41c6-b610-9ade449a1084",
    "Content-Type": "application/json",
  },
};

/* Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки. */
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, { // Запрос к API-серверу
    headers: config.headers, // Подставляем заголовки
  }).then(getResponseData);  // Проверяем успешность выполнения запроса
};

export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, { // Запрос к API-серверу для получения карточек
    headers: config.headers, // Подставляем заголовки
  }).then(getResponseData); // Проверяем успешность выполнения запроса
};

export const updateAvatar = (link) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {  // Измените эндпоинт
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify({
      avatar: link,
    })
  }).then(getResponseData);
};

export const addCard = (cardName, cardLink) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      name: cardName,
      link: cardLink,
    })
  }).then(getResponseData);
}

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
}; 

export const changeLikeCardStatus = (cardID, isLiked) => {
  return fetch(`${config.baseUrl}/cards/likes/${cardID}`, {
    method: isLiked ?  "DELETE" : "PUT",
    headers: config.headers,
  }).then((res) => getResponseData(res));
};

export const deleteCardApi = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: config.headers,
  }).then(getResponseData);
};
