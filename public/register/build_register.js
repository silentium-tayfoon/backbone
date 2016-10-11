var register_var =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	// clear require cache (need for Hot Module Replacement)
	//delete require.cache[require.resolve('./../../js_modules/register/register.js')];
	
	var register = __webpack_require__(1);
	
	register();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	var register_form_template = __webpack_require__(2);
	var register_template = __webpack_require__(3);
	
	module.exports = function(){
	
		//console.log(NODE_ENV);
	
		$(function(){
	
		/** dom links --------------- */
	
			var COUNTRY = 'UA';
			var post_data = document.getElementById('post_data');
			//var register_template = document.getElementById('register_template');
			//var register_form_template = document.getElementById('register_form_template');
			var save_data = document.querySelector('.save_data');
			var navbar = document.querySelector('.navbar');
	
			var min = function(val){
				var pass = false;
				if(val.length && val.length > 1){
					pass = true;
				}
				return pass;
			};
	
	
			var User = Backbone.Model.extend({
				url:'/api/users',
		       	defaults: {
		       		first_name: 'new in model no first name',
		            last_name: 'new in model no last name',
					country: COUNTRY,
					vehicle1: null,
					vehicle2: true,
					gender: 'female'
		       	},
		       	initialize: function(){
	
					// this.on('change', function(model){
					// 	console.log('saved');
					// });
	
					this.on("invalid", function(model, error){
						console.log(error);
					});
		       	},
		       	validate: function(attributes){
		       		if(attributes.first_name.length < 10){
		       			return 'name length < 10';
		       		}
		       		//_.each(attributes, min, this);
		       	}
			});
	
			var UsersList = Backbone.Collection.extend({
				model: User,
				url: '/api/users/',
				initialize: function(){
					var self = this;
					this.on('add', function(self){
						console.log('save');
						console.log(self);
					});
				}
			});	
	
			var users_list = new UsersList();
	
			users_list.fetch();
	
			window.users_list = users_list;
	
			var Button = Backbone.View.extend({
				initialize: function(){
					this.listenTo(this.model, 'invalid', function(){
						console.log('BUTTON invalid');
						this.$el.removeClass('btn-danger').addClass('btn-default');
					});
					this.listenTo(this.model, 'request', function(){
						console.log('BUTTON request');
						this.$el.removeClass('btn-default').addClass('btn-danger');
					});
					this.listenTo(this.model, 'sync', function(){
						console.log('BUTTON sync');
						this.$el.removeClass('btn-danger').addClass('btn-default');
					});
				},
				model: null,
				el: null,
				reinit: function(model){
					this.model = model;
					this.initialize();
				}
			});
	
			var RegisterCustomerForm = Backbone.View.extend({
				initialize: function(){
	
					this.new_user = new this.model({});
	
			        this.render();
	
			        window.b = this.button = new Button({
			        					'model': this.new_user,
			        					'el': this.$el.find('[name="Submit"]')
			        				});
	
			        this.listenTo(this.new_user, 'invalid', function(){
			        	console.log('INVALID VALIDATION');
			        } );
			    },
			    model: User,
				el: '#registerCustomerForm',
				template: _.template(register_form_template),
				events: {
					'click .save_data': 'saveData'
				},
				getValFromDom: function(val, key){
	
					if(!key){debugger;}
					var $domElement = this.$el.find('[name='+key+']');
					var checked = 'false';
	
					if($domElement.attr('type') === 'radio'){
	
						// find checked radio and get it value
						this.new_user.set(key, this.$el.find('[name='+key+']:checked').val());	
	
					} else if($domElement.attr('type') === 'checkbox'){
	
						// check if element checked	
						checked = ($domElement.is(':checked')) ? 'true' : 'false';
						this.new_user.set(key, checked);
	
					} else {
	
						// simply put set value
						this.new_user.set(key, $domElement.val());	
					}
				},
				collection: users_list,
				saveData: function(){
					//this.$el.find('[name="Submit"]').removeClass('btn-default').addClass('btn-danger');
	
					var list_view = this;
	
					//window.user = this.new_user = new this.model({});
	
					console.log('save new user - ' + this.new_user.cid + '  ' + this.new_user);
	
					_.each(this.new_user.attributes, this.getValFromDom, this);
	
					this.new_user.save('','',{
							success: function(){
								console.log('!!!!! all good');
	
								list_view.collection.add(list_view.new_user);
								// set .isNew to false by set id
								if(!list_view.new_user.attributes.id){
									console.log('set id:' + list_view.collection.length);
									list_view.new_user.set('id', list_view.collection.length);
								}
	
								// add new empty user
								list_view.new_user = new list_view.model({});
								list_view.button.reinit(list_view.new_user);
								//list_view.$el.find('[name="Submit"]').removeClass('btn-danger').addClass('btn-default');
							},
							error: function(){
								console.log('Save new user on server FAILL');
							},
							wait: true
						}); 
				},
				render: function(){
					this.$el.html(this.template({data:this.new_user.attributes}));
					return this;		
				}
			});
	
			var user = new User({});
			var registerUser = new RegisterCustomerForm({});
	
			var UserDataListDeleteAll = Backbone.View.extend({
				initialize: function(){
					this.listenTo(this.model, 'add', this.render);
	
					var lazy_render = _.debounce(this.render, 300);
	
					this.listenTo(this.model, 'destroy', lazy_render);
				},
				events: {
					click : function(){
						this.deleteAll();
					}
				},
				el: '#clear_all',
				template: 'clear all',
				model: users_list,
				render: function(){
	
					console.log('re count - '+this.model.length);
					this.$el.empty().text(this.template + ' ( ' + this.model.length + ' )');
				},
				deleteAll: function(){
					var self = this;
					console.log('deleteAll run');
					this.model.models.forEach(function(model){
	
							//HACK
							if(model.isNew()){
								model.set('id', model.get('_id'), {silent:true});
							}
	
						var destroyed = model.destroy({
								success: function(model, response) {
									if(response && response.id){
										console.log('deleted id: ' + response.id);		
									}else{
										console.log('deleted id: NO ID');
									}
								},
								error: function(model){
									console.log('error'); //' cant delete model '+model.get('_id')
								},
								wait: true,
								url: '/api/users/'+model.get('_id')
							});
						//console.log('destroyed id: ' + model.get('_id') + ' = ' + destroyed);
					});
				}
			});
	
			var deleteAllButton = new UserDataListDeleteAll();
	
			var UserDataList = Backbone.View.extend({
				initialize: function(){
					this.listenTo(users_list, 'add', this.render);
					this.listenTo(users_list, 'destroy', this.remove);
			    },
				el: '#post_data',
				template: _.template(register_template),
				model: users_list,
				render: function(){
					console.log('render');
					var user_list_view = this;
					var all_elements = '';
					this.$el.empty();
					user_list_view.model.models.forEach(function(model){
						all_elements = all_elements + user_list_view.template({d:model.attributes});
					});
	
					user_list_view.$el.append(all_elements);
	
					return this;
				},
				remove: function(){
					this.$el.empty();
					this.model.reset();
				}
			});
	
			var userData = new UserDataList();
	
		});
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = "<input type=\"hidden\" value=\"<%= (data.id) ? data.id : 'null' %>\" name=\"id\" />\n\n<ul class=\"list-group\">\n\t<li class=\"list-group-item\">\n\t\t<label class='highLabel' data-label='first_name' for=\"first_name\">First name</label>\n\t\t<input type=\"text\" value=\"<%= data.first_name %>\" name=\"first_name\" class=\"form-control\" placeholder=\"first name\" id='first_name' required />\n\t</li>\n\t<li class=\"list-group-item\">\n\t\t<span class='highLabel' data-label='last_name'>Last name</span>\n\t\t<input type=\"text\" value=\"<%= data.last_name %>\" name=\"last_name\" class=\"form-control\" placeholder=\"last name\" />\n\t</li>\n\t<li class=\"list-group-item\">\n\t\t<span class='highLabel'>Transport</span><br>\n\t\t<label><input type=\"checkbox\" name=\"vehicle1\" value=\"true\" \n\t\t<% if(data.vehicle1){%> checked <% } %>> I have a bike</label><br>\n\t\t\t<label><input type=\"checkbox\" name=\"vehicle2\" value=\"true\"\n\t\t\t<% if(data.vehicle2){%> checked <% } %>> I have a car</label>\n\t</li>\n\t<li class=\"list-group-item\">\n\t\t<span class='highLabel' data-label='access'>Gender</span><br>\n\t\t<label><input type=\"radio\" name=\"gender\" value=\"male\" \n\t\t<% if(data.gender === 'male'){%> checked <% } %>> Male</label><br>\n\t\t<label><input type=\"radio\" name=\"gender\" value=\"female\"\n\t\t<% if(data.gender === 'female'){%> checked <% } %>> Female</label><br>\n\t\t<label><input type=\"radio\" name=\"gender\" value=\"other\"\n\t\t<% if(data.gender === 'other'){%> checked <% } %>> Other</label>\n\t</li>\n\t<li class=\"list-group-item\">\n\t\t<span class='highLabel'>Country</span>\n\t\t<select name=\"country\" value=\"<%= (data.country) ? data.country : '' %>\" class=\"select_standart select2-hidden-accessible form-control\">\n\t\t\t<option value=\"AX\">Åland Islands</option>\n\t\t\t<option value=\"AF\">Afghanistan</option>\n\t\t\t<option value=\"AL\">Albania</option>\n\t\t\t<option value=\"DZ\">Algeria</option>\n\t\t\t<option value=\"AS\">American Samoa</option>\n\t\t\t<option value=\"AD\">Andorra</option>\n\t\t\t<option value=\"AO\">Angola</option>\n\t\t\t<option value=\"AI\">Anguilla</option>\n\t\t\t<option value=\"AQ\">Antarctica</option>\n\t\t\t<option value=\"AG\">Antigua And Barbuda</option>\n\t\t\t<option value=\"AR\">Argentina</option>\n\t\t\t<option value=\"AM\">Armenia</option>\n\t\t\t<option value=\"AW\">Aruba</option>\n\t\t\t<option value=\"AU\">Australia</option>\n\t\t\t<option value=\"AT\">Austria</option>\n\t\t\t<option value=\"AZ\">Azerbaijan</option>\n\t\t\t<option value=\"BS\">Bahamas</option>\n\t\t\t<option value=\"BH\">Bahrain</option>\n\t\t\t<option value=\"BD\">Bangladesh</option>\n\t\t\t<option value=\"BB\">Barbados</option>\n\t\t\t<option value=\"BY\">Belarus</option>\n\t\t\t<option value=\"BE\">Belgium</option>\n\t\t\t<option value=\"BZ\">Belize</option>\n\t\t\t<option value=\"BJ\">Benin</option>\n\t\t\t<option value=\"BM\">Bermuda</option>\n\t\t\t<option value=\"BT\">Bhutan</option>\n\t\t\t<option value=\"BO\">Bolivia</option>\n\t\t\t<option value=\"BA\">Bosnia and Herzegovina</option>\n\t\t\t<option value=\"BW\">Botswana</option>\n\t\t\t<option value=\"BV\">Bouvet Island</option>\n\t\t\t<option value=\"BR\">Brazil</option>\n\t\t\t<option value=\"IO\">British Indian Ocean Territory</option>\n\t\t\t<option value=\"BN\">Brunei</option>\n\t\t\t<option value=\"BG\">Bulgaria</option>\n\t\t\t<option value=\"BF\">Burkina Faso</option>\n\t\t\t<option value=\"BI\">Burundi</option>\n\t\t\t<option value=\"KH\">Cambodia</option>\n\t\t\t<option value=\"CM\">Cameroon</option>\n\t\t\t<option value=\"CA\">Canada</option>\n\t\t\t<option value=\"CV\">Cape Verde</option>\n\t\t\t<option value=\"KY\">Cayman Islands</option>\n\t\t\t<option value=\"CF\">Central African Republic</option>\n\t\t\t<option value=\"TD\">Chad</option>\n\t\t\t<option value=\"CL\">Chile</option>\n\t\t\t<option value=\"CN\">China</option>\n\t\t\t<option value=\"CX\">Christmas Island</option>\n\t\t\t<option value=\"CC\">Cocos (Keeling) Islands</option>\n\t\t\t<option value=\"CO\">Colombia</option>\n\t\t\t<option value=\"KM\">Comoros</option>\n\t\t\t<option value=\"CG\">Congo</option>\n\t\t\t<option value=\"CD\">Congo, Democractic Republic</option>\n\t\t\t<option value=\"CK\">Cook Islands</option>\n\t\t\t<option value=\"CR\">Costa Rica</option>\n\t\t\t<option value=\"CI\">Cote D'Ivoire (Ivory Coast)</option>\n\t\t\t<option value=\"HR\">Croatia (Hrvatska)</option>\n\t\t\t<option value=\"CU\">Cuba</option>\n\t\t\t<option value=\"CY\">Cyprus</option>\n\t\t\t<option value=\"CZ\">Czech Republic</option>\n\t\t\t<option value=\"DK\">Denmark</option>\n\t\t\t<option value=\"DJ\">Djibouti</option>\n\t\t\t<option value=\"DM\">Dominica</option>\n\t\t\t<option value=\"DO\">Dominican Republic</option>\n\t\t\t<option value=\"EC\">Ecuador</option>\n\t\t\t<option value=\"EG\">Egypt</option>\n\t\t\t<option value=\"SV\">El Salvador</option>\n\t\t\t<option value=\"GQ\">Equatorial Guinea</option>\n\t\t\t<option value=\"ER\">Eritrea</option>\n\t\t\t<option value=\"EE\">Estonia</option>\n\t\t\t<option value=\"ET\">Ethiopia</option>\n\t\t\t<option value=\"FK\">Falkland Islands</option>\n\t\t\t<option value=\"FO\">Faroe Islands</option>\n\t\t\t<option value=\"FJ\">Fiji Islands</option>\n\t\t\t<option value=\"FI\">Finland</option>\n\t\t\t<option value=\"FR\">France</option>\n\t\t\t<option value=\"GF\">French Guiana</option>\n\t\t\t<option value=\"PF\">French Polynesia</option>\n\t\t\t<option value=\"TF\">French Southern Territories</option>\n\t\t\t<option value=\"GA\">Gabon</option>\n\t\t\t<option value=\"GM\">Gambia, The</option>\n\t\t\t<option value=\"GE\">Georgia</option>\n\t\t\t<option value=\"DE\">Germany</option>\n\t\t\t<option value=\"GH\">Ghana</option>\n\t\t\t<option value=\"GI\">Gibraltar</option>\n\t\t\t<option value=\"GR\">Greece</option>\n\t\t\t<option value=\"GL\">Greenland</option>\n\t\t\t<option value=\"GD\">Grenada</option>\n\t\t\t<option value=\"GP\">Guadeloupe</option>\n\t\t\t<option value=\"GU\">Guam</option>\n\t\t\t<option value=\"GT\">Guatemala</option>\n\t\t\t<option value=\"GN\">Guinea</option>\n\t\t\t<option value=\"GW\">Guinea-Bissau</option>\n\t\t\t<option value=\"GY\">Guyana</option>\n\t\t\t<option value=\"HT\">Haiti</option>\n\t\t\t<option value=\"HM\">Heard and McDonald Islands</option>\n\t\t\t<option value=\"HN\">Honduras</option>\n\t\t\t<option value=\"HK\">Hong Kong S.A.R.</option>\n\t\t\t<option value=\"HU\">Hungary</option>\n\t\t\t<option value=\"IS\">Iceland</option>\n\t\t\t<option value=\"IN\">India</option>\n\t\t\t<option value=\"ID\">Indonesia</option>\n\t\t\t<option value=\"IR\">Iran</option>\n\t\t\t<option value=\"IQ\">Iraq</option>\n\t\t\t<option value=\"IE\">Ireland</option>\n\t\t\t<option value=\"IL\">Israel</option>\n\t\t\t<option value=\"IT\">Italy</option>\n\t\t\t<option value=\"JM\">Jamaica</option>\n\t\t\t<option value=\"JP\">Japan</option>\n\t\t\t<option value=\"JO\">Jordan</option>\n\t\t\t<option value=\"KZ\">Kazakhstan</option>\n\t\t\t<option value=\"KE\">Kenya</option>\n\t\t\t<option value=\"KI\">Kiribati</option>\n\t\t\t<option value=\"KR\">Korea</option>\n\t\t\t<option value=\"KP\">Korea, North</option>\n\t\t\t<option value=\"KW\">Kuwait</option>\n\t\t\t<option value=\"KG\">Kyrgyzstan</option>\n\t\t\t<option value=\"LA\">Laos</option>\n\t\t\t<option value=\"LV\">Latvia</option>\n\t\t\t<option value=\"LB\">Lebanon</option>\n\t\t\t<option value=\"LS\">Lesotho</option>\n\t\t\t<option value=\"LR\">Liberia</option>\n\t\t\t<option value=\"LY\">Libya</option>\n\t\t\t<option value=\"LI\">Liechtenstein</option>\n\t\t\t<option value=\"LT\">Lithuania</option>\n\t\t\t<option value=\"LU\">Luxembourg</option>\n\t\t\t<option value=\"MO\">Macau S.A.R.</option>\n\t\t\t<option value=\"MK\">Macedonia</option>\n\t\t\t<option value=\"MG\">Madagascar</option>\n\t\t\t<option value=\"MW\">Malawi</option>\n\t\t\t<option value=\"MY\">Malaysia</option>\n\t\t\t<option value=\"MV\">Maldives</option>\n\t\t\t<option value=\"ML\">Mali</option>\n\t\t\t<option value=\"MT\">Malta</option>\n\t\t\t<option value=\"MH\">Marshall Islands</option>\n\t\t\t<option value=\"MQ\">Martinique</option>\n\t\t\t<option value=\"MR\">Mauritania</option>\n\t\t\t<option value=\"MU\">Mauritius</option>\n\t\t\t<option value=\"YT\">Mayotte</option>\n\t\t\t<option value=\"MX\">Mexico</option>\n\t\t\t<option value=\"FM\">Micronesia</option>\n\t\t\t<option value=\"MD\">Moldova</option>\n\t\t\t<option value=\"MC\">Monaco</option>\n\t\t\t<option value=\"MN\">Mongolia</option>\n\t\t\t<option value=\"ME\">Montenegro</option>\n\t\t\t<option value=\"MS\">Montserrat</option>\n\t\t\t<option value=\"MA\">Morocco</option>\n\t\t\t<option value=\"MZ\">Mozambique</option>\n\t\t\t<option value=\"MM\">Myanmar</option>\n\t\t\t<option value=\"NA\">Namibia</option>\n\t\t\t<option value=\"NR\">Nauru</option>\n\t\t\t<option value=\"NP\">Nepal</option>\n\t\t\t<option value=\"NL\">Netherlands</option>\n\t\t\t<option value=\"AN\">Netherlands Antilles</option>\n\t\t\t<option value=\"NC\">New Caledonia</option>\n\t\t\t<option value=\"NZ\">New Zealand</option>\n\t\t\t<option value=\"NI\">Nicaragua</option>\n\t\t\t<option value=\"NE\">Niger</option>\n\t\t\t<option value=\"NG\">Nigeria</option>\n\t\t\t<option value=\"NU\">Niue</option>\n\t\t\t<option value=\"NF\">Norfolk Island</option>\n\t\t\t<option value=\"MP\">Northern Mariana Islands</option>\n\t\t\t<option value=\"NO\">Norway</option>\n\t\t\t<option value=\"OM\">Oman</option>\n\t\t\t<option value=\"PK\">Pakistan</option>\n\t\t\t<option value=\"PW\">Palau</option>\n\t\t\t<option value=\"PS\">Palestinian Territory</option>\n\t\t\t<option value=\"PA\">Panama</option>\n\t\t\t<option value=\"PG\">Papua new Guinea</option>\n\t\t\t<option value=\"PY\">Paraguay</option>\n\t\t\t<option value=\"PE\">Peru</option>\n\t\t\t<option value=\"PH\">Philippines</option>\n\t\t\t<option value=\"PN\">Pitcairn Island</option>\n\t\t\t<option value=\"PL\">Poland</option>\n\t\t\t<option value=\"PT\">Portugal</option>\n\t\t\t<option value=\"PR\">Puerto Rico</option>\n\t\t\t<option value=\"QA\">Qatar</option>\n\t\t\t<option value=\"RE\">Reunion</option>\n\t\t\t<option value=\"RO\">Romania</option>\n\t\t\t<option value=\"RU\">Russia</option>\n\t\t\t<option value=\"RW\">Rwanda</option>\n\t\t\t<option value=\"SH\">Saint Helena</option>\n\t\t\t<option value=\"KN\">Saint Kitts And Nevis</option>\n\t\t\t<option value=\"LC\">Saint Lucia</option>\n\t\t\t<option value=\"PM\">Saint Pierre and Miquelon</option>\n\t\t\t<option value=\"VC\">Saint Vincent And The Grenadines</option>\n\t\t\t<option value=\"WS\">Samoa</option>\n\t\t\t<option value=\"SM\">San Marino</option>\n\t\t\t<option value=\"ST\">Sao Tome and Principe</option>\n\t\t\t<option value=\"SA\">Saudi Arabia</option>\n\t\t\t<option value=\"SN\">Senegal</option>\n\t\t\t<option value=\"RS\">Serbia</option>\n\t\t\t<option value=\"SC\">Seychelles</option>\n\t\t\t<option value=\"SL\">Sierra Leone</option>\n\t\t\t<option value=\"SG\">Singapore</option>\n\t\t\t<option value=\"SK\">Slovakia</option>\n\t\t\t<option value=\"SI\">Slovenia</option>\n\t\t\t<option value=\"SB\">Solomon Islands</option>\n\t\t\t<option value=\"SO\">Somalia</option>\n\t\t\t<option value=\"ZA\">South Africa</option>\n\t\t\t<option value=\"GS\">South Georgia And The S.S Islands</option>\n\t\t\t<option value=\"ES\">Spain</option>\n\t\t\t<option value=\"LK\">Sri Lanka</option>\n\t\t\t<option value=\"SD\">Sudan</option>\n\t\t\t<option value=\"SR\">Suriname</option>\n\t\t\t<option value=\"SJ\">Svalbard And Jan Mayen Islands</option>\n\t\t\t<option value=\"SZ\">Swaziland</option>\n\t\t\t<option value=\"SE\">Sweden</option>\n\t\t\t<option value=\"CH\">Switzerland</option>\n\t\t\t<option value=\"SY\">Syria</option>\n\t\t\t<option value=\"TW\">Taiwan</option>\n\t\t\t<option value=\"TJ\">Tajikistan</option>\n\t\t\t<option value=\"TZ\">Tanzania</option>\n\t\t\t<option value=\"TH\">Thailand</option>\n\t\t\t<option value=\"TL\">Timor-Leste</option>\n\t\t\t<option value=\"TG\">Togo</option>\n\t\t\t<option value=\"TK\">Tokelau</option>\n\t\t\t<option value=\"TO\">Tonga</option>\n\t\t\t<option value=\"TT\">Trinidad And Tobago</option>\n\t\t\t<option value=\"TN\">Tunisia</option>\n\t\t\t<option value=\"TR\">Turkey</option>\n\t\t\t<option value=\"TM\">Turkmenistan</option>\n\t\t\t<option value=\"TC\">Turks And Caicos Islands</option>\n\t\t\t<option value=\"TV\">Tuvalu</option>\n\t\t\t<option value=\"UG\">Uganda</option>\n\t\t\t<option value=\"UA\">Ukraine</option>\n\t\t\t<option value=\"AE\">United Arab Emirates</option>\n\t\t\t<option value=\"GB\">United Kingdom</option>\n\t\t\t<option value=\"US\">United States</option>\n\t\t\t<option value=\"UM\">United States Minor Outlying Islands</option>\n\t\t\t<option value=\"UY\">Uruguay</option>\n\t\t\t<option value=\"UZ\">Uzbekistan</option>\n\t\t\t<option value=\"VU\">Vanuatu</option>\n\t\t\t<option value=\"VA\">Vatican City State (Holy See)</option>\n\t\t\t<option value=\"VE\">Venezuela</option>\n\t\t\t<option value=\"VN\">Vietnam</option>\n\t\t\t<option value=\"VG\">Virgin Islands (British)</option>\n\t\t\t<option value=\"VI\">Virgin Islands (US)</option>\n\t\t\t<option value=\"EH\">Western Sahara</option>\n\t\t\t<option value=\"WF\">Wallis And Futuna Islands</option>\n\t\t\t<option value=\"YE\">Yemen</option>\n\t\t\t<option value=\"ZM\">Zambia</option>\n\t\t\t<option value=\"ZW\">Zimbabwe</option>\n\t\t</select>\n\t</li>\n\t<li class=\"list-group-item\">\n\t\t<button type=\"reset\" value=\"Reset\" class=\"btn btn-default\">Reset</button>\n\t\t<button name=\"Submit\" type=\"button\" class=\"btn btn-primary pull-right save_data\">Save</button>\n\t</li>\n</ul>";

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "<div class=\"entry\">\n\t<span>User № <%= d._id %></span>\n\t<ul class=\"list-group\">\n\t\t<li class=\"list-group-item\">\n\t\t\tFirst name : <%= d.first_name %>\n\t\t</li>\t\n\t\t<li class=\"list-group-item\">\n\t\t\tLast name : <%= d.last_name %>\n\t\t</li>\n\t\t<li class=\"list-group-item\">\n\t\t\tTransport : <%= (d.vehicle1) ? \"bike\" : '' \n\t\t\t\t\t\t%><%= (d.vehicle1 && d.vehicle2) ? \", \" : '' \n\t\t\t\t\t\t%><%= (d.vehicle2) ? \"car\" : '' %>\n\t\t</li>\n\t\t<li class=\"list-group-item\">\n\t\t\tGender : <%= d.gender %>\n\t\t</li>\n\t\t<li class=\"list-group-item\">\n\t\t\tCountry : <%= d.country %>\n\t\t</li>\n\t</ul>\n</div>";

/***/ }
/******/ ]);
//# sourceMappingURL=build_register.js.map