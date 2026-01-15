/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { deleteCardApi, changeLikeCardStatus, addCard, updateAvatar, getUserInfo, getCardList,  setUserInfo } from "./components/api.js"
import { enableValidation, clearValidation } from "./components/validation.js"
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";


// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileButton = profileForm.querySelector(".button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardButton = cardFormModalWindow.querySelector(".button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const deleteCardModalWindow = document.querySelector(".popup_type_remove-card"); // Новый попап
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");
const deleteCardButton = deleteCardModalWindow.querySelector(".popup__button");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarButton = avatarForm.querySelector(".button");

// Новые DOM элементы для попапа с информацией
const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");

let userId = "";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let cardToDelete = null;
let cardElementToDelete = null;

const showLoading = (button, isLoading, defaultText) => {
  if (isLoading) {
    button.textContent = defaultText + "..."; 
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
};

// Функция для форматирования даты
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Шаблоны для создания элементов
const getInfoTemplate = () => {
  return document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);
};

const getUserPreviewTemplate = () => {
  return document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);
};

// Функция создания строки информации
const createInfoString = (term, description) => {
  const infoElement = getInfoTemplate();
  infoElement.querySelector(".popup__info-term").textContent = term;
  infoElement.querySelector(".popup__info-description").textContent = description;
  return infoElement;
};

// Функция создания превью пользователя
const createUserPreview = (user) => {
  const userElement = getUserPreviewTemplate();
  userElement.textContent = user.name;
  userElement.style.backgroundImage = `url(${user.avatar})`;
  userElement.title = user.name; // Добавляем подсказку при наведении
  return userElement;
};

// Обработчик клика на кнопку информации
const handleInfoClick = (cardId) => {
  // Очищаем предыдущие данные
  cardInfoModalInfoList.innerHTML = "";
  cardInfoModalUsersList.innerHTML = "";
  
  // Получаем актуальные данные с сервера
  getCardList()
    .then((cards) => {
      // Находим нужную карточку
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        throw new Error("Карточка не найдена");
      }
      
      // Устанавливаем заголовок
      cardInfoModalTitle.textContent = cardData.name;
      
      // Создаем элементы информации
      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );
      
      cardInfoModalInfoList.append(
        createInfoString(
          "Количество лайков:",
          cardData.likes.length.toString()
        )
      );
      
      cardInfoModalInfoList.append(
        createInfoString(
          "Автор:",
          cardData.owner.name
        )
      );
      
      // Если есть лайки, показываем список пользователей
      if (cardData.likes.length > 0) {
        cardInfoModalText.textContent = "Понравилось:";
        
        // Создаем элементы для каждого пользователя
        cardData.likes.forEach(user => {
          cardInfoModalUsersList.append(createUserPreview(user));
        });
      } else {
        cardInfoModalText.textContent = "Пока нет лайков";
      }
      
      // Открываем модальное окно
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при получении информации о карточке:", err);
      alert("Не удалось загрузить информацию о карточке");
    });
};

const handleLikeCardClick = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      const likeCountElement = likeButton.closest('.card__likes').querySelector('.card__like-count');
      likeCountElement.textContent = (updatedCard.likes.length > 0) ? updatedCard.likes.length : "";
    })
    .catch((err) => {
      console.error("Ошибка при изменении лайка:", err);
    });
};

// Функция для удаления карточки
const openDeleteCardModal = (cardElement, cardId) => {
  cardElementToDelete = cardElement;
  cardToDelete = cardId;
  openModalWindow(deleteCardModalWindow);
};

const handleDeleteCardConfirm = (evt) => {
  evt.preventDefault();
  
  showLoading(deleteCardButton, true, "Удаление");
  
  deleteCardApi(cardToDelete)
    .then(() => {
      cardElementToDelete.remove();
      closeModalWindow(deleteCardModalWindow);
      
      // Сброс переменных
      cardElementToDelete = null;
      cardToDelete = null;
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
      alert("Не удалось удалить карточку. Попробуйте еще раз.");
    })
    .finally(() => {
      showLoading(deleteCardButton, false, "Удаление");
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  showLoading(profileButton, true, "Сохранение")
  const name = profileTitleInput.value;
  const about = profileDescriptionInput.value;
  
  setUserInfo({ name, about })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      showLoading(profileButton, false, "Сохранение")
      closeModalWindow(avatarFormModalWindow);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  showLoading(avatarButton, true, "Сохранение")
  updateAvatar(avatarInput.value)
    .then((data) => {
      profileAvatar.style.backgroundImage = `url(${data.avatar})`;
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
      alert("Не удалось обновить аватар. Попробуйте еще раз.");
    })
    .finally(() => {
      showLoading(avatarButton, false, "Сохранение")
      closeModalWindow(avatarFormModalWindow);
    });

};


const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  showLoading(cardButton, true, "Создание")
  addCard(cardNameInput.value, cardLinkInput.value)
  .then((data) => {
    placesWrap.prepend(
      createCardElement(
        false, // isLiked
        {
          name: data.name,
          link: data.link,
          _id: data._id,
          likes: data.likes,
          owner: data.owner
        },
        userId,

        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCardClick,
          onDeleteCard: openDeleteCardModal,
          onInfoClick: handleInfoClick,
        }
      )
    );
  }).catch((err) => {
      console.error("Ошибка при создании карточки:", err);
      alert("Не удалось создать карточку. Проверьте правильность введенных данных.");
  }).finally(() => {
    closeModalWindow(cardFormModalWindow);
    showLoading(cardButton, false, "Создание")
  })
};


// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
deleteCardForm.addEventListener("submit", handleDeleteCardConfirm);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  
  clearValidation(profileForm, validationSettings);
  enableValidation(validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  enableValidation(validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  enableValidation(validationSettings);
  openModalWindow(cardFormModalWindow);
});


const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

setCloseModalWindowEventListeners(cardInfoModalWindow);


Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach((cardData) => {
      const isLiked = cardData.likes.some(like => like._id === userId);
      placesWrap.append(
        createCardElement(isLiked, cardData, userId,  {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCardClick,
          onDeleteCard: openDeleteCardModal,
          onInfoClick: handleInfoClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });