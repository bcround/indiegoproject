import { fireauth } from './firebaseSetting';
import { firestore } from './firebaseSetting';
import loginLogo from '../assets/login.svg';
import loginImage from '../assets/login-image.svg';
import closeBtn from '../assets/close-btn.svg';
import _ from 'lodash';

const login = () => {
  // get DOM Elements
  const $login = document.querySelector('.login') as HTMLElement;
  const $loginBtn = document.querySelector('.login-btn') as HTMLButtonElement; 
  const $logoutBtn = document.querySelector('.logout-btn') as HTMLButtonElement; 
  const $loginForm = document.querySelector('.login-form-container > form') as HTMLFormElement;
  const $loginbg = document.querySelector('.login-popup-bg') as HTMLDivElement;
  const $loginLogo = document.querySelector('.login-logo') as HTMLImageElement;
  const $loginImage = document.querySelector('.login-image') as HTMLImageElement;
  const $closeBtn = document.querySelector('.close-btn') as HTMLSpanElement;
  const $closeBtnImg = $closeBtn.firstElementChild as HTMLImageElement;
  const $email = document.querySelector('form > #loginEmail') as HTMLInputElement;
  const $password = document.querySelector('form > #loginPwd') as HTMLInputElement;
  const $signin = document.querySelector('.sign-in') as HTMLButtonElement;

  const usersColRef = firestore.collection('Users');

  const initialize = (): void => {
    $login.classList.toggle('is-active');
    $email.value = '';
    $password.value = '';
  }

  const showPopUp = (): void => {
    $loginLogo.src = loginLogo;
    $loginImage.src = loginImage;
    $closeBtnImg.src = closeBtn;

    $login.classList.toggle('is-active'); 
  }

  const closePopUp = (e: Event): void => {
    if (e.target !== $loginbg && e.target !== $closeBtnImg) return;

    initialize();
  }

  const signIn = async (e: Event) => {
    e.preventDefault();

    try {
      const user: any = await fireauth.signInWithEmailAndPassword($email.value, $password.value);

      const querySnapshot: any = await usersColRef.get();

      querySnapshot.forEach((doc: any) => {
        if (doc.data().userEmail !== user.user.email) {
          usersColRef.add({
            userEmail: user.user.email,
            favorites: []
          });
        }
      });
      initialize();
    } 
    catch (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert(error);
    }
  }

  // label placeholder part
  const labelTransition = (): void => {
    console.log('gogo');
  }

  const validationCheck = (e: KeyboardEvent): void => {
    const $inputTarget = e.target as HTMLInputElement;
    const $labelInput = $inputTarget.previousElementSibling as HTMLLabelElement;

    let regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/ as RegExp;
    if ($inputTarget.id === 'loginPwd') regExp = /$/ as RegExp;

    if (!regExp.test($inputTarget.value) || $inputTarget.value === '') {
      $inputTarget.classList.add('not-valid');
      $labelInput.style.color = 'red';
      $signin.disabled = true;
      } else {
        $inputTarget.classList.remove('not-valid');
        $labelInput.style.color = '';
        $signin.disabled = false;
      }
  };

  const signOut = async () => {
    try {
      const user = await fireauth.signOut();
      window.alert(`You're signed out!`);
    } 
    catch (error) {
      window.alert(error);
    }
  };




  $email.addEventListener('keyup', _.throttle(validationCheck, 1000));
  $password.addEventListener('keyup', _.throttle(validationCheck, 1000));
  $email.addEventListener('focus', labelTransition);
  $loginForm.addEventListener('submit', signIn);
  $loginBtn.addEventListener('click', showPopUp);
  $loginbg.addEventListener('click', closePopUp);
  $logoutBtn.addEventListener('click', signOut);

  fireauth.onAuthStateChanged(user =>{
    if (user) {
      $loginBtn.style.display = 'none';
      $logoutBtn.style.display = 'block';
    }
    else {
      $loginBtn.style.display = 'block';
      $logoutBtn.style.display = 'none';
    }
  });
}

export default login;