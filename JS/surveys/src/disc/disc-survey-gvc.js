const surveyData = {
	"surveyID": 1,
	"page": window.location.pathname,
	"action": "http://localhost:5000/surveys",
	"title": "Страничный опрос",
	"btnText": "ПРОЙТИ ОПРОС",
	"questions": [
		{
		"question": "Насколько были <b>понятны</b> материалы данной дисциплины?",
		"name": "q1",
		"type": "radio",
		"output": "inline",
		"answers": ["1", "2", "3", "4", "5"]
		},
		{
		"question": "Какой информации по дисциплине Вам не хватает?",
		"name": "q2",
		"type": "radio",
		"output": "block",
		"answers": ["Примеров решения", "Практических материалов",
					"Теоретических материалов", "Требований к дисциплине",
					"Другое"]
		},
		{
		"question": "Встретились ли Вам ошибки/недочеты на данной странице?",
		"name": "q3",
		"type": "radio",
		"output": "inline",
		"answers": ["0", "1"],
		"labels": ["Нет", "Да"]
		},
		{
		"question": "Подскажите, что можно исправить/улучшить на данной странице?",
		"name": "q4",
		"type": "textarea",
		"output": "block"
		}
	]
}


/*next file*/


function createSurveyBtn(btnText) {
	let btn = document.createElement('button');
	btn.innerHTML = btnText;
	btn.setAttribute('id', 'btnSurvey');
	return btn;
}

function createRootModal() {
	let modal = document.createElement('div');
	modal.setAttribute('id', 'modalSurvey');
	modal.className = 'modal';
	return modal;
}

function createModalContent() {
	content = document.createElement('form');
	content.setAttribute('id', 'modalContent');
	content.className = 'modal-content';
	return content;
}

function createHiddenInput(name, value) {
	let hidInput = document.createElement('input');
	hidInput.setAttribute('type', 'text');
	hidInput.setAttribute('name', name);
	hidInput.setAttribute('hidden', 'true');
	hidInput.setAttribute('value', value);
	return hidInput;
}

function createSurveyClose() {
	let close = document.createElement('span');
	close.setAttribute('id', 'clsSurvey');
	close.className = "closeSpan";
	close.innerHTML = "&times;";
	return close;
}

function createSurveyTitle(title) {
	let h3 = document.createElement('h3');
	h3.innerHTML = title;
	return h3;
}

function createRadioInput(name) {
	let radio = document.createElement('input');
	radio.setAttribute('type', 'radio');
	radio.setAttribute('name', name);
	radio.setAttribute('required', 'true');
	return radio
}

function createTextarea(name) {
	let textarea = document.createElement('textarea');
	textarea.setAttribute('rows', '3');
	textarea.setAttribute('name', name);
	return textarea;
}

function createResetBtn() {
	let btn = document.createElement('button');
	btn.setAttribute('type', 'reset');
	btn.innerHTML = 'Очистить';
	return btn;
}

function createSubmitBtn() {
	let btn = document.createElement('button');
	btn.setAttribute('type', 'submit');
	btn.setAttribute('id', 'btnSubmit');
	btn.innerHTML = 'Отправить';
	return btn;
}

function surveyBuilder(survey) {

	// Create the button that opens the modal
	let btnOpen = createSurveyBtn(survey['btnText']);
	document.body.prepend(btnOpen);

	//create root and content modal element's
	let modalSurvey = createRootModal();
	let modalContent = createModalContent();
	//adding in tail modalContent to modalSurvey
	modalSurvey.append(modalContent);

	//create hidden surveyID input and append to modalContent
	let surveyID = createHiddenInput('surveyID', survey['surveyID']);
	modalContent.append(surveyID);

	//create hidden page path input
	let page = createHiddenInput('page', survey['page']);
	modalContent.append(page);

	// create close span and append to modalContent
	let clsSurvey = createSurveyClose();
	modalContent.append(clsSurvey);

	//append survey title for modal
	let title = createSurveyTitle(survey.title);
	modalContent.append(title);

	//for each question in survey
	for (let quest of survey.questions) {

		let ask = document.createElement('p');
		ask.innerHTML = quest.question;
		modalContent.append(ask);

		if (quest.type == 'radio') {
			let answer = createRadioInput(quest.name);

			if (quest.output == 'block') {

				//wrapper for align text to left
				let divLeft = document.createElement('div');
				divLeft.className = 'text-left';

				for (let value of quest.answers) {

					let copyAnswer = answer.cloneNode();
					copyAnswer.setAttribute('value', value);

					let label = document.createElement('label')
					label.className = 'ml-3';
					label.innerHTML = value;

					//each answer must begin on new row
					let div = document.createElement('div');
					div.append(copyAnswer);
					div.append(label);

					//add to wrapper with left align
					divLeft.append(div);
				}
				modalContent.append(divLeft);

			} else {

				let divRow = document.createElement('div');
				divRow.className = 'row';

				let divCol = document.createElement('div');
				divCol.className = 'col';
				for (let value of quest.answers) {
					
					let copyAnswer = answer.cloneNode();
					copyAnswer.setAttribute('value', value);

					let title = document.createElement('p');
					title.innerHTML = value;

					//radio and title must be under each other
					let copyCol = divCol.cloneNode();
					copyCol.append(copyAnswer);
					copyCol.append(title);

					divRow.append(copyCol);
				}
				modalContent.append(divRow);
			}

		}

		if (quest.type == 'textarea') {
			let answer = createTextarea(quest.name);

			let div = document.createElement('div');
			div.append(answer);
			modalContent.append(div);
		}

	}

	
	
	let btnReset = createResetBtn();
	let btnSubmit = createSubmitBtn();

	let divBtns = document.createElement('div'); 
	divBtns.append(btnReset);
	divBtns.append(btnSubmit);

	modalContent.append(divBtns);
	document.body.append(modalSurvey);
}
//TODO: check uniqueID add
function checkUniqueID() {
	const uniqueID = getCookie('uniqueID');
	if (uniqueID == undefined) {
		uniqueID = localStorage.getItem('uniqueID');
	}
}
//
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

/*LAUNCH SURVEY*/
surveyBuilder(surveyData);

const modalSurvey = document.getElementById('modalSurvey');

// When the user clicks anywhere outside of the modalContent, close it
window.addEventListener('click', () => {
	if (event.target == modalSurvey) modalSurvey.style.display = "none";
});

const btnSurvey = document.getElementById('btnSurvey');
btnSurvey.addEventListener('click', () => {
	modalSurvey.style.display = "block";
});

const clsSurvey = document.getElementById('clsSurvey');
clsSurvey.addEventListener('click', () => {
	modalSurvey.style.display = "none";
});

	
const modalContent = document.getElementById('modalContent');
modalContent.addEventListener('submit', sendSurveyResult);

function sendSurveyResult(event) {
	event.preventDefault();

	const xhr = new XMLHttpRequest();
    	// Bind the FormData object and the form element
   	let FD = new FormData(modalContent);
    //TEMPORALLY
   	FD.append('uniqueID', '1');
    	// Define what happens on successful data submission
   	xhr.addEventListener( "load", (event) => {
    	 console.log( event.target.responseText );
   	});
	    // Define what happens in case of error
    xhr.addEventListener("error", (event) => {
      console.log('Oops! Something went wrong.');
    });
    // Set up our request
  	xhr.open("POST", "http://localhost:5000/surveys");
    // The data sent is what the user provided in the form
  	xhr.send(FD);
	modalContent.innerHTML = '<h2>Ваш ответ отправлен.<br>Спасибо за участие!</h2>';
	
	setTimeout(() => {
		modalSurvey.style.display = "none";
		btnSurvey.style.display = "none";
	}, 1000)
}