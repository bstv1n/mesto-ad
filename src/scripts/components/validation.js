let errorClass = '';
let inputErrorClass = '';
let inactiveButtonClass = '';

function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  errorClass = config.errorClass;
  inputErrorClass = config.inputErrorClass;
  inactiveButtonClass = config.inactiveButtonClass
  forms.forEach(form => {
    setEventListeners(form, config);
  });
}

function clearValidation(formElement, config) {
  const submitButton = formElement.querySelector(config.submitButtonSelector);
  disableSubmitButton(submitButton, config);

  const inputs = formElement.querySelectorAll(config.inputSelector);
  inputs.forEach(input => {
    const errorElement = formElement.querySelector(`#${input.id}-error`);
    console.log(input.id);
    errorElement.textContent = "";
    console.log(errorElement)
    hideInputError(input, errorElement, config.inputErrorClass, config.errorClass);
  });
}

function setEventListeners(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  const button = form.querySelector(config.submitButtonSelector);

  inputs.forEach((input) => {
    const errorElement = form.querySelector(`#${input.id}-error`);
    input.addEventListener('input', () => {
      console.log(36);
      if (input.value === ""){
        hideInputError(input, errorElement, config.inputErrorClass, config.errorClass);
      }
      if (input.type == "url"){
        checkInputValidity(input, errorElement, conditionCustomErrMsgLinkInp, config);
      } else {
        checkInputValidity(input, errorElement, conditionCustomErrMsgTextInp, config);
      }
      toggleButtonState(form, button, config);
    });
  })
}

function checkInputValidity (input, errorElement, conditionCustomErr, config) {
  if (!input.validity.valid) {
    if (conditionCustomErr(input.validity)) {
      showInputError(input, errorElement, input.dataset.errorMessage, config.inputErrorClass, config.errorClass);
    }else {
      showInputError(input, errorElement, input.validationMessage, config.inputErrorClass, config.errorClass);
    }
    return false;
  }

  hideInputError(input, errorElement, config.inputErrorClass, config.errorClass);
  return true;
}

function toggleButtonState(form, submitButton, config) {
  const isFormValid = form.checkValidity();
  
  if (isFormValid)
    enableSubmitButton(submitButton, config);
  else
    disableSubmitButton(submitButton, config);
}

function disableSubmitButton(submitButton, config) {
  submitButton.disabled = true;
  submitButton.classList.add(config.inactiveButtonClass);
}

function enableSubmitButton(submitButton, config) {
  submitButton.disabled = false;
  submitButton.classList.remove(config.inactiveButtonClass);
}

function showInputError(inputElement, errorElement, message, inputErrorClass, errorClass) {
  inputElement.classList.add(inputErrorClass);
  errorElement.textContent = message;
  errorElement.classList.add(errorClass);
}

function hideInputError(inputElement, errorElement, inputErrorClass, errorClass) {
  inputElement.classList.remove(inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(errorClass);
}

function conditionCustomErrMsgTextInp (validity) {
  return validity.patternMismatch || validity.tooShort || validity.tooLong;
}

function conditionCustomErrMsgLinkInp (validity) {
  return validity.typeMismatch;
}

export { enableValidation, clearValidation };