const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  isLiked,
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const cardLikesCount = cardElement.querySelector(".card__like-count");
  const cardId = data._id;
  const cardOwnerId = data.owner._id;
  const cardLikes = data.likes;
  const countLike = cardLikes.length;

  // Скрываем кнопку удаления, если текущий пользователь не владелец
  if (cardOwnerId !== userId) {
    deleteButton.style.display = 'none';
  }

  cardLikesCount.textContent = (countLike > 0) ? countLike : "";

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, cardId));
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, cardId));
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(cardId));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};