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
		"answers": ["0", "1"]
		},
		{
		"question": "Подскажите, что можно исправить/улучшить на данной странице?",
		"name": "q4",
		"type": "textarea",
		"output": "block"
		}
	]
}
