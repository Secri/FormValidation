class FormValidation {
				
				static eltHandled    = ['input', 'textarea', 'fieldset'];
				
				static usableRegex   = {
											   email: /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i,
											password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,}$/,
											    date: /^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/,
											  number: /^-?\d+((\.|,)\d+)?$/,
											     url: /^(http(s?):\/\/)?(www\.)?[a-zA-Z0-9\.\-\_]+(\.[a-zA-Z]{2,3})+(\/[a-zA-Z0-9\_\-\s\.\/\?\%\#\&\=]*)?$/,
											     tel: /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/
									   };
									   
				static errorMessages = {
											   email: 'L\'email saisi est invalide',
											password: 'Ce mot de passe n\'est pas assez sécurisé',
											    date: 'La date saisie est invalide',
											  number: 'Le nombre saisi est invalide',
											     url: 'L\'adresse URL saisie est invalide',
											     tel: 'Le numéro de téléphone saisi est invalide',
											   empty: 'Ce champ est obligatoire'
									   };
									   
				elementCollection = [];
				
				validFields       = [];
				cantBeBlank       = [];
				invalidFields     = [];
				
				constructor( form ) {
					this.form = form;
					this.collectFormElt();
					this.handleForm();
				}
				
				handleForm() {
				
					this.form.addEventListener('submit', (event) => {
						
						for (const elt of this.elementCollection) {
							if ( this.blankCheck(elt) === false && this.regexCheck(elt) === false ) {
								this.validFields.push(elt);
							}
						}
						
						/* For verification purpose */
						console.log(this.elementCollection);
						console.log(this.validFields);
						console.log(this.cantBeBlank);
						console.log(this.invalidFields);
						
						this.clearAll();
						
						if (this.cantBeBlank.length > 0 || this.invalidFields.length > 0) {
							
							event.preventDefault();
							console.log('submission prevented');
							this.displayErrors(this.cantBeBlank);
							this.displayErrors(this.invalidFields);
						}
						
						this.validFields = [];
						this.cantBeBlank = [];
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
					
					if (element.value.trim().length === 0 && element.getAttribute('aria-required') === 'true') {
						this.cantBeBlank.push(element);
						return true;
					}
					return false;
					
				}
				
				regexCheck(element) {
				
					if (element.tagName === 'INPUT' && element.type != 'text') {
						if (element.value.trim().length > 0 ) {
							if (! element.value.match (FormValidation.usableRegex[element.type])) {
								this.invalidFields.push([element, 'regex']);
								console.log('invalid ' + element.type);
								return true;
							}
						}
					}
					return false;
				
				}
				
				displayErrors(fieldsArray) {
					if (fieldsArray.length > 0) {
						let i = 0;
						for (const field of fieldsArray) {
							i++;
							let errorMsg = document.createElement('span');
							errorMsg.classList.add('errorMsg');
							if ( Array.isArray( field ) ) {
								
								errorMsg.setAttribute('id', 'invalid_' + field.nodeName + i);
								if (field[1] === 'regex') {
									errorMsg.textContent = FormValidation.errorMessages[ field[0].type ];
								}
								
								field[0].insertAdjacentElement('afterend', errorMsg);
								field[0].setAttribute('aria-invalid', 'true');
								field[0].setAttribute('aria-errormessage', 'invalid_' + field.nodeName + i);
								
							} else {
								errorMsg.setAttribute('id', 'blank_' +  field.nodeName + i);
								errorMsg.textContent = FormValidation.errorMessages['empty'];
								field.insertAdjacentElement('afterend', errorMsg);
								field.setAttribute('aria-invalid', 'true');
								field.setAttribute('aria-errormessage', 'blank_' +  field.nodeName + i);
							}
						}
					}
					return;
				}
				
				clearAll() {
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
			/*****************************************************************/
			var contactForms  = document.querySelectorAll('form');
			var formInstances = {};
			for (let i = 0; i < contactForms.length; i++) {
				formInstances[i] = new FormValidation(contactForms[i]);
			}
			/***********************************************************************/
			const config = { attributes: false, childList: true, subtree: false };//Options pour le mutation observer, on s'occupe de la liste des enfants uniquement
				
			const observer = new MutationObserver(mutobs_callback);// On crée une instance du mutation observer
				
			function mutobs_callback(mutationList, observer) { //Fonction de callback du mutation observer
							
				for (const mutation of mutationList) {//Pour chaque mutation de la liste
								
					if (mutation.type === "childList") {//si la liste des noeuds enfant a été modifiée
									
						console.log('A mutation of the childNodes has been observed');
						for (const [key, value] of Object.entries(formInstances)) {
							value.collectFormElt();
						}
					}				
				}
								
			}
			//On lance la méthode d'observation du mutation observer
			const eltList = document.querySelector('form'); //Noeud parent qui sera observé

			observer.observe(eltList, config);
