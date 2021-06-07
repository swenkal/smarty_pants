
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
	close.className = "close";
	close.innerHTML = "&times;";
	return close;
}

function createSurveyTitle(title) {
	let h3 = document.createElement('h3');
	title.innerHTML = title;
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
		let answer;
		if (quest.type == 'radio') {
			answer = document.createElement('input');
			answer.setAttribute('type', 'radio');
			answer.setAttribute('name', quest.name);
			answer.setAttribute('required', 'true');

			if (quest.output == 'block') {

				for (let value of quest.answers) {
					let div = document.createElement('div');
					let clone = answer.cloneNode();
					clone.setAttribute('value', value);
					div.append(clone);
					div.append(value);
					modalContent.append(div);
				}

			} else {
				let divRow = document.createElement('div');
				divRow.className = 'row';
				let divCol = document.createElement('div');
				divCol.className = 'col';
				for (let value of quest.answers) {
					let cloneCol = divCol.cloneNode();
					let clone = answer.cloneNode();
					clone.setAttribute('value', value);
					clone.innerHTML = '';
					let title = document.createElement('p');
					title.innerHTML = value;
					cloneCol.append(clone);
					cloneCol.append(title);
					divRow.append(cloneCol);
				}
				modalContent.append(divRow);
			}

		}

		if (quest.type == 'textarea') {
			let div = document.createElement('div');
			answer = document.createElement('textarea');
			answer.setAttribute('rows', '3');
			answer.setAttribute('name', quest.name);
			div.append(answer);
			modalContent.append(div);
		}

	}

	let pButtons = document.createElement('p');
	let btnReset = document.createElement('button');
	btnReset.setAttribute('type', 'reset');
	btnReset.innerHTML = 'Очистить';
	pButtons.append(btnReset);

	let btnSubmit = document.createElement('button');
	btnSubmit.setAttribute('type', 'submit');
	btnSubmit.setAttribute('id', 'btnSubmit');
	btnSubmit.innerHTML = 'Отправить'
	pButtons.append(btnSubmit);

	modalContent.append(pButtons);
	document.body.append(modalSurvey);

	btnOpen.addEventListener('click', () => {
		modalSurvey.style.display = "block";
	});

	clsSurvey.addEventListener('click', () => {
		modalSurvey.style.display = "none";
	});

	// When the user clicks anywhere outside of the modalContent, close it
	window.addEventListener('click', () => {
		if (event.target == modalSurvey) modalSurvey.style.display = "none";
	});

	modalContent.addEventListener('submit', (e) => {
		e.preventDefault();
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
	      console.log( 'Oops! Something went wrong.' );
	    });

    	// Set up our request
   		 xhr.open( "POST", "http://localhost:5000/surveys" );

    	// The data sent is what the user provided in the form
   		 xhr.send( FD );

		modalContent.innerHTML = '<h2>Ваш ответ отправлен.<br>Спасибо за участие!</h2>';
		setTimeout(() => {
			modalSurvey.style.display = "none";
			btnOpen.style.display = "none";
		}, 1000)

	});
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
