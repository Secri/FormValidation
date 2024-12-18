class FormValidation {
			
				static eltHandled = ['input', 'textarea', 'fieldset'];
				
				static usableRegex   = { //Expression régulières à utiliser pour le match - Les propriétés servent aussi à check les types d'input gérés par le script
											    text: /^[ -~¡-ÿ]+$/, //Caractères unicodes acceptés pour les langues latines
											   email: /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i,
											password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,}$/,
											    date: /^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/,
											  number: /^-?\d+((\.|,)\d+)?$/,
											     url: /^(http(s?):\/\/)?(www\.)?[a-zA-Z0-9\.\-\_]+(\.[a-zA-Z]{2,3})+(\/[a-zA-Z0-9\_\-\s\.\/\?\%\#\&\=]*)?$/,
											     tel: /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/
									   };
				
				static errorMessages = { //Messages d'erreur personnalisés
											    text: 'L\'un des caractères saisis est invalide',
											   email: 'L\'email saisi est invalide',
											password: 'Ce mot de passe n\'est pas assez sécurisé',
											    date: 'La date saisie est invalide',
											  number: 'Le nombre saisi est invalide',
											     url: 'L\'adresse URL saisie est invalide',
											     tel: 'Le numéro de téléphone saisi est invalide',
											   empty: 'Ce champ est obligatoire',
											   check: 'Veuillez sélectionner au moins une option'
									   };
									   
				elementCollection = [];
				validFields       = [];
				invalidFields     = [];
				
				constructor( form ) {
					this.form = form; //Récupère le formulaire
					this.collectFormElt(); //Collecte les éléments à valider
					this.handleForm(); //Gère l'événement soumission
				}
				
				handleForm() {
				
					this.form.addEventListener('submit', (event) => { //On crée un écouteur sur l'événement soumission
											
						for (const elt of this.elementCollection) {
							switch (elt.tagName) {
								case 'INPUT':
									for (const property in FormValidation.usableRegex) {
										if (elt.type == property) {
											if ( this.blankCheck(elt) === false && this.regexCheck(elt) === false ) {
												this.validFields.push(elt);
											}
										}
									}
									break;
								case 'TEXTAREA':
									if ( this.blankCheck(elt) === false ) {
										this.validFields.push(elt);
									}
									break;
								case 'FIELDSET':
									if ( this.fieldsetCheck(elt) === false ) {
										this.validFields.push(elt);
									}
									break;
							}
						}
						
						this.clearAll(); //On clear les statuts invalides et les messages d'erreur
						
						if (this.invalidFields.length > 0) {
							event.preventDefault(); //On bloque la soumission du formulaire
							console.log('submission prevented'); //For verification purpose
							this.displayErrors(this.invalidFields);
						}
						
						this.validFields = [];
						this.invalidFields = [];
					});
				
				}
				
				collectFormElt() {
					this.elementCollection = [];
					for (const elt of FormValidation.eltHandled ) {
						if (this.form.querySelectorAll(elt).length > 0) {
							for (const child of this.form.querySelectorAll(elt)) {
								this.elementCollection.push(child);
							}
						}
					}
				}
				
				blankCheck(element) {
					element.value = element.value.trim();
					if (element.value.length === 0 && element.getAttribute('aria-required') === 'true') {
						this.invalidFields.push([element, 'empty']);
						return true;
					}
					return false;
				}
				
				regexCheck(element) {
					element.value = element.value.trim();
					if (element.value.length > 0 ) {
						if (element.tagName === 'INPUT') {	
							if (! element.value.match (FormValidation.usableRegex[element.type])) {
								this.invalidFields.push([element, 'regex']);
								return true;
							}
						}
					}
					return false;
				}
				
				fieldsetCheck(element) {
					if (element.getAttribute('aria-required') === 'true') {
						const eltCollection = element.querySelectorAll('input');
						for (const elt of eltCollection) {
							if (elt.checked) {
								return false;
							}
						}
						this.invalidFields.push([element, 'check']);
						return true;
					}
					return false;
				}
				
				displayErrors(fieldsArray) {
					if (fieldsArray.length > 0) {
						let i = 0; //On met en place une incrémentation pour générer des id non redondantes
						for (const field of fieldsArray) {
							i++;
							let errorMsg = document.createElement('span');//Création de l'élément qui va contenir le msg
							errorMsg.classList.add('errorMsg');
							errorMsg.setAttribute('id', 'invalid_' + field.nodeName + i); //Attribution de l'id
							switch (field[1]) {
								case 'regex':
									errorMsg.textContent = FormValidation.errorMessages[ field[0].type ];//On va chercher le message d'erreur dans la propriété statique errorMessages et on l'injecte
									break;
								case 'empty':
									errorMsg.textContent = FormValidation.errorMessages['empty'];
									break;
								case 'check':
									errorMsg.textContent = FormValidation.errorMessages['check'];
									break;
							}
							field[0].insertAdjacentElement('afterend', errorMsg); //On ajoute le message juste après l'élément invalide
							field[0].setAttribute('aria-invalid', 'true'); //On ajoute l'attribut aria-invalid
							field[0].setAttribute('aria-errormessage', 'invalid_' + field.nodeName + i); //On ajoute l'attribut aria-error message qui se réfère à l'id de l'élément invalide
							this.correctionListener(field[0]);
						}
					}
					return;
				}
				
				correctionListener(element) {
					if (element.tagName === 'FIELDSET') {
						element.addEventListener('change', (event) => {
							this.removeError(element);
						});
					} else {
						let currentContent = element.value.trim();
						element.addEventListener('input', (event) => {
							if (element.value.trim().length === 0 || element.value.trim() != currentContent ) {
								this.removeError(element);
							}
						});
					}
				}
				
				removeError(element) {
					element.removeAttribute('aria-invalid');
					element.removeAttribute('aria-errormessage');
					if (element.nextElementSibling && element.nextElementSibling.classList.contains('errorMsg')) {
						element.nextElementSibling.remove();
					}
				}
				
				clearAll() { //Supprime les attributs aria et l'ensemble des messages d'erreur
					for (const elt of this.validFields) {
						elt.removeAttribute('aria-invalid'); //Si l'attribut n'existe pas return sans générer d'erreur
						elt.removeAttribute('aria-errormessage'); //Si l'attribut n'existe pas return sans générer d'erreur
					}
					let messages = document.querySelectorAll('span.errorMsg');
					for (const msg of messages) {
						msg.remove();
					}
				}
			
			}
						
			/*************************** MUTATION OBSERVER **************************************/
			var contactForms  = document.querySelectorAll('form'); //Collection de tous les formulaires de la page
			var formInstances = {}; //Collection des futures instances FormValidation
			for (let i = 0; i < contactForms.length; i++) {
				formInstances[i] = new FormValidation(contactForms[i]); //On stocke les instances dans formTnstances
			}
			const config = { attributes: false, childList: true, subtree: false }; //Options pour le mutation observer, on s'occupe de la liste des enfants uniquement
				
			const observer = new MutationObserver(mutobs_callback); // On crée une instance du mutation observer
				
			function mutobs_callback(mutationList, observer) { //Fonction de callback du mutation observer
							
				for (const mutation of mutationList) { //Pour chaque mutation de la liste
								
					if (mutation.type === "childList") { //Si la liste des noeuds enfant a été modifiée
						for (const [key, value] of Object.entries(formInstances)) { //On parcourt les instances de FormValidation
							value.collectFormElt(); //On relance la méthode de récupération des éléments du formulaire pour inclure les éventuels nouveaux éléments
						}
					}				
				}
								
			}
			//On lance la méthode d'observation de l'instance mutation observer
			for (const form of contactForms) {
				observer.observe(form, config);
			}
			
			/*********** SIMULATION D'UN CHAMP REPETABLE ***********/
			const createElt = document.getElementById('createElt');
			createElt.addEventListener('click', (event) => {
				let container  = document.createElement('div');
				let info       = document.createElement('label');
				info.textContent = "Simulation d'un champ répétable";
				container.append(info);
				let field      = document.createElement('input');
				field.type       = 'text';
				field.setAttribute('aria-required', 'true');
				container.append(field);
				let submitButton = document.querySelector('form button');
				submitButton.insertAdjacentElement('beforebegin', container);
			});
