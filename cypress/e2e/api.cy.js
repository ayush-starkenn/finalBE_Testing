const PORT = 8080;
describe("testing the whole bunch of different apis", () => {
  it("testing the user_controllers", () => {
    let nr = Math.random().toFixed(2)
    const customer_email = "abc" + `${nr.toString()}` + "@gmail.com"
    const customer_mobile = 4455444444 + nr * 100;
    //code for testing the login function
    cy.request("POST", `http://localhost:${PORT}/api/login`, {
      email: "piyush@starkenn.com",
      password: "qwerty"
    }).then((res) => {
      cy.wrap(res.body).should('have.property', 'message', 'Login successful!');
      cy.wrap(res.body.user).should('have.property', 'user_uuid');
      cy.wrap(res.body).should('have.property', 'token');
      const token = res.body.token;
      const user_uuid = res.body.user.user_uuid;

      // till here we got logged in and got the token 

      //--> doing for the customer-Controller
      cy.request({
        method: 'GET',
        url: `http://localhost:${PORT}/api/customers/get-all-customer`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res) => {
        cy.log(res.body);
        cy.wrap(res.body).should('have.property', 'total_count');
        cy.wrap(res.body.customerData).each((ele) => {
          cy.wrap(ele).should('have.property', 'user_id');
          cy.wrap(ele).should('have.property', 'user_uuid');
          cy.wrap(ele).should('have.property', 'first_name');
          cy.wrap(ele).should('have.property', 'last_name');
          cy.wrap(ele).should('have.property', 'email');
          cy.wrap(ele).should('have.property', 'user_type');
          cy.wrap(ele).should('have.property', 'company_name');
          cy.wrap(ele).should('have.property', 'address');
          cy.wrap(ele).should('have.property', 'state');
          cy.wrap(ele).should('have.property', 'city');
          cy.wrap(ele).should('have.property', 'pincode');
          cy.wrap(ele).should('have.property', 'phone');
          cy.wrap(ele).should('have.property', 'user_status');
          cy.wrap(ele).should('have.property', 'created_at');
          cy.wrap(ele).should('have.property', 'created_by');
          cy.wrap(ele).should('have.property', 'modified_at');
          cy.wrap(ele).should('have.property', 'modified_by');
        })

      });

      //create customer here;
      cy.request({
        method: 'POST',
        url: `http://localhost:8080/api/customers/signup`,
        headers: {
          authorization: `bearer ${token}`
        },
        body: {
          userUUID: user_uuid,
          first_name: 'abc',
          last_name: 'def',
          email: customer_email,
          password: 'qwerty',
          user_type: 2,
          company_name: 'ST',
          address: 'Banner',
          state: 'MH',
          city: 'Pune',
          pincode: 411038,
          phone: customer_mobile,
        }
      }).then((ress) => {
        cy.wrap(ress.body.message).should('eq', 'Customer Added Successfully!')
      })

      // customer logged in now login him to get customer_uuid;

      cy.request("POST", `http://localhost:${PORT}/api/login`, {
        email: customer_email,
        password: "qwerty"
      }).then((res) => {
        cy.wrap(res.body).should('have.property', 'message', 'Login successful!');
        cy.wrap(res.body.user).should('have.property', 'user_uuid');
        const customer_uuid = res.body.user.user_uuid;

        //now login admin

        cy.request("POST", `http://localhost:${PORT}/api/login`, {
          email: "piyush@starkenn.com",
          password: "qwerty"
        }).then((res) => {
          cy.wrap(res.body).should('have.property', 'message', 'Login successful!');
          cy.wrap(res.body.user).should('have.property', 'user_uuid');
          cy.wrap(res.body).should('have.property', 'token');
          const token = res.body.token;
          const user_uuid = res.body.user.user_uuid;


          //now doing it for the customer update
          // const updatedData= {
          //   first_name:"piyush",
          //   last_name:"akotkar",
          //   email:"piyush@starkenn.com",
          //   company_name:"starkenn Technoloies",
          //   address:"malik nagar",
          //   state:"seth jii",
          //   city: "gumnaam",
          //   pincode: 411038,
          //   phone: 9897875655,
          //   userUUID: user_uuid,
          // }
          // cy.request({
          //   method: 'PUT',
          //   url: `http://localhost:${PORT}/api/customers/update-customer/${user_uuid}`,
          //   headers: {
          //     authorization: `bearer ${token}`
          //   },
          //   updatedData
          // }).then((res)=>{
          //   cy.log(res.message);
          // })

          //doing for get customer by id
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/customers/get/${customer_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            cy.wrap(res.body.customerData).each((ele) => {
              cy.wrap(ele).should('have.property', 'user_uuid', customer_uuid)
            })
          })

          //doing it for total Customer-count
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/customers/total-customers`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            cy.wrap(res.body.result).each((ele) => {
              cy.wrap(ele).should('have.property', 'count');
            })
          })


          //Devices #

          //add devices
          let rn = Math.random().toFixed(2);
          rn = rn * 100;
          cy.log('printing user uuid: ', customer_uuid);
          const deviceData = {
            device_id: `DMS_NLC_${rn}`,
            device_type: "DMS",
            user_uuid: customer_uuid,
            sim_number: `77664${rn}`,
            status: 2,
            userUUID: user_uuid
          }

          const EditdeviceData = {
            device_id: `DMS_NLC_${rn}`,
            device_type: "DMS",
            user_uuid: customer_uuid,
            sim_number: `77664${rn}`,
            status: 2,
            userUUID: user_uuid
          }

          cy.request({
            method: 'POST',
            url: `http://localhost:${PORT}/api/devices/add-device`,
            headers: {
              authorization: `bearer ${token}`
            },
            body: deviceData
          }).then((res) => {
            cy.log("successfully stored");
          })

          // edit device
          cy.request({
            method: 'PUT',
            url: `http://localhost:${PORT}/api/devices/edit-device/${deviceData.device_id}`,
            headers: {
              authorization: `bearer ${token}`
            },
            body: EditdeviceData // Use "headers" instead of "header"
          }).then(() => {
            cy.log("Successfully Edited the device");
          });


          //delete the device
          cy.request({
            method: 'PUT',
            url: `http://localhost:${PORT}/api/devices/delete-device/${deviceData.device_id}`,
            headers: {
              authorization: `bearer ${token}`
            },
            body: deviceData // Use "headers" instead of "header"
          }).then((res) => {
            cy.wrap(res.status).should('eq', 201);
          });

          //get list of all devices
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/list-devices`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            cy.wrap(res.body.devices).each(e => {
              cy.log(e.device_id)

              //get device by id
              cy.request({
                method: 'GET',
                url: `http://localhost:${PORT}/api/devices/get-device-by-id/${e.device_id}`,
                headers: {
                  authorization: `bearer ${token}`
                }
              }).then((res) => {
                cy.wrap(res.body.device).each(f => {
                  cy.wrap(f.device_id).should('eq', e.device_id)
                })
              });


            })


            


            // if you need to use customer if then work over here
          });

          //get customer list
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/get-customerlist`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            res.body.users.forEach((user) => {
              expect(user).to.have.property('user_uuid');
              expect(user).to.have.property('first_name');
              expect(user).to.have.property('last_name');
            });
          });

          //get user device list
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/get-user-devices-list/${customer_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            res.body.results.forEach((ress) => {
              expect(ress).to.have.property('device_id');
              expect(ress).to.have.property('device_type');
            });
          });

          //get user ecu
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/get-user-ecu/${customer_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.message);
          });

          //get user iot
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/get-user-iot/${customer_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.message);
          });

          //get user dms
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/get-user-dms/${customer_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.message);
          });

          //get total devices count
          cy.request({
            method: 'GET',
            url: `http://localhost:${PORT}/api/devices/total-devices`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.message);
          });


          //analytics threshhold
          let atLink = `http://localhost:${PORT}/api/analytics-threshold`;

          const bodySent = {
            customer_id: customer_uuid,
            title: "particular change",
            status: 1,
            userUUID: user_uuid,
            brake: '2.4',
            tailgating: '2.4',
            rash_driving: '2.4',
            sleep_alert: '2.4',
            over_speed: '2.4',
            green_zone: '2.4',
            minimum_distance: '2.4',
            minimum_driver_rating: '2.4',
            ttc_difference_percentage: '24',
            total_distance: '45',
            duration: '2.4',
          }

          cy.request({
            method: 'POST',
            url: `${atLink}/add-analytics`,
            headers: {
              authorization: `bearer ${token}`
            },
            body: bodySent
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.message);
          });

          //api to get all the analytics threshold;
          cy.request({
            method: 'GET',
            url: `${atLink}/get-analytics-threshold`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res) => {
            // Check if each object in the response body has the expected properties
            cy.log(res.body.total_count);
            cy.wrap(res.body.analyticData).each((ele) => {

              cy.request({
                method: 'GET',
                url: `${atLink}/get-AnalyticsThresholds-ById/${ele.threshold_uuid}`,
                headers: {
                  authorization: `bearer ${token}`
                }
              }).then((ress) => {
                cy.log(ress.body.message)
              })


              //request for update
              const UpdatebodySent = {
                user_uuid: ele.user_uuid,
                title: "particular change",
                score: {
                  brake: "213",
                  tailgating: "23",
                  rash_driving: "221",
                  sleep_alert: "232",
                  over_speed: "321",
                  green_zone: "312"
                },
                incentive: {
                  minimum_distance: "432",
                  minimum_driver_rating: "4"
                },
                accident: {
                  ttc_difference_percentage: "21"
                },
                leadership_board: {
                  total_distance: "3232"
                },
                halt: {
                  duration: "212"
                },
                status: 2,
                userUUID: user_uuid
              }
              cy.request({
                method: 'PUT',
                url: `${atLink}/update-analytic-threshold/${ele.threshold_uuid}`,
                headers: {
                  authorization: `bearer ${token}`
                },
                body: UpdatebodySent
              }).then((ress) => {
                cy.log(ress.body.message)
              })

              //delete the threshold
              cy.request({
                method: 'PUT',
                url: `${atLink}/delete-analytic-threshold/${ele.threshold_uuid}`,
                headers: {
                  authorization: `bearer ${token}`
                },
                body: UpdatebodySent
              }).then((ress) => {
                cy.log(ress.body.message)
              })
               
              
            })

          //doing it for feature set now;
          //feature set

          let featureSetLink = `http://localhost:${PORT}/api/featuresets`;
          //add featureset
           let featuresetBody = {
            "user_uuid": user_uuid,
            "featureset_name": "Raghu Featureset",
            "featureset_users": [
                {
                    "user_uuid": customer_uuid
                }
            ],
            "featuerset_version": 1,
            "featureset_data": {
                "mode": "1",
                "CASMode": "1",
                "activationSpeed": "10",
                "alarmThreshold": "2",
                "brakeThreshold": "0.5",
                "brakeSpeed": "40",
                "detectStationaryObject": "1",
                "allowCompleteBrake": "1",
                "detectOncomingObstacle": "1",
                "safetyMode": "1",
                "ttcThreshold": "10",
                "brakeOnDuration": "1000",
                "brakeOffDuration": "1000",
                "start_time": "12",
                "stop_time": "12",
                "sleepAlertMode": "1",
                "preWarning": "5",
                "sleepAlertInterval": "60",
                "sa_activationSpeed": "40",
                "startTime": "23",
                "stopTime": "6",
                "brakeActivateTime": "10",
                "braking": "1",
                "driverEvalMode": "1",
                "maxLaneChangeThreshold": "0.35",
                "minLaneChangeThreshold": "-0.35",
                "maxHarshAccelerationThreshold": "0.25",
                "minHarshAccelerationThreshold": "-0.4",
                "suddenBrakingThreshold": "-0.4",
                "maxSpeedBumpThreshold": "0.5",
                "minSpeedBumpThreshold": "-0.5",
                "GovernerMode": "1",
                "speedLimit": "100",
                "cruiseMode": "1",
                "cruiseactivationSpeed": "40",
                "vehicleType": "1",
                "obdMode": "1",
                "protocolType": "0",
                "tpmsMode": "1",
                "acceleratorType": "1",
                "VS_brk_typ": "1",
                "VS_gyro_type": "1",
                "lazerMode": "1",
                "rfSensorMode": "1",
                "rfAngle": "0",
                "rdr_act_spd": "40",
                "rdr_type": "1",
                "Sensor_res1": "1",
                "speedSource": "1",
                "slope": "4.5",
                "offset": "0.5",
                "delay": "30",
                "rfNameMode": "1",
                "noAlarm": "30",
                "speed": "30",
                "accelerationBypass": "10",
                "tim_err_tpms": "1",
                "rfSensorAbsent": "60",
                "gyroscopeAbsent": "60",
                "hmiAbsent": "60",
                "timeNotSet": "59",
                "brakeError": "60",
                "tpmsError": "60",
                "obdAbsent": "60",
                "noAlarmSpeed": "60",
                "laserSensorAbsent": "60",
                "rfidAbsent": "60",
                "iotAbsent": "60",
                "acc_board": "60",
                "SBE_dd": "60",
                "SBE_alcohol": "60",
                "SBE_temp": "60",
                "firmwareOtaUpdate": "1",
                "firewarereserver1": "0",
                "firewarereserver2": "0",
                "alcoholDetectionMode": "1",
                "alcoholinterval": "10",
                "alcoholact_spd": "40",
                "alcoholstart_time": "12",
                "alcoholstop_time": "12",
                "alcoholmode": "1",
                "driverDrowsinessMode": "1",
                "dd_act_spd": "40",
                "dd_acc_cut": "1",
                "dd_strt_tim": "12",
                "dd_stop_tim": "12",
                "dd_res1": "0",
                "load_sts": "1",
                "load_max_cap": "10",
                "load_acc": "1",
                "fuelMode": "1",
                "fuel_tnk_cap": "100",
                "fuel_intvl1": "0",
                "fuel_intvl2": "0",
                "fuel_acc": "1",
                "fuel_thrsh": "10"
            }
        }
                cy.request({
                  method: 'POST',
                  url: `${featureSetLink}/add-featureset`,
                  headers: {
                    authorization: `bearer ${token}`
                  },
                  body: featuresetBody
                }).then((res)=>{
                  cy.wrap(res.body.message).should('eq', "Successfully featureset added");
    
                  //featureset ends here
                });

                //get all feature set
                cy.request({
                  method: 'GET',
                  url: `${featureSetLink}/get-all-featureset`,
                  headers: {
                    authorization: `bearer ${token}`
                  }
                }).then((Res)=>{
                  cy.wrap(Res.body.message).should('eq', "Successfully got list of all featureset"); 
                });

                //get user feature set
                cy.request({
                  method: 'GET',
                  url: `${featureSetLink}/get-user-featureset/${customer_uuid}`,
                  headers: {
                    authorization: `bearer ${token}`
                  }
                }).then((Res)=>{
                  cy.wrap(Res.body.message).should('eq', "Successfully retrieved user's featuresets");

                  cy.wrap(Res.body.results).each((ele)=>{
                    //edit featureSet
                                          
                      let editFeaturesetBody = {
                        "user_uuid": user_uuid,
                        "featureset_name": "Raghu Featureset",
                        "featureset_users": [
                            {
                                "user_uuid": customer_uuid
                            }
                        ],
                        "featuerset_version": 1,
                        "featureset_data": {
                            "mode": "1",
                            "CASMode": "1",
                            "activationSpeed": "10",
                            "alarmThreshold": "2",
                            "brakeThreshold": "0.5",
                            "brakeSpeed": "40",
                            "detectStationaryObject": "1",
                            "allowCompleteBrake": "1",
                            "detectOncomingObstacle": "1",
                            "safetyMode": "1",
                            "ttcThreshold": "10",
                            "brakeOnDuration": "1000",
                            "brakeOffDuration": "1000",
                            "start_time": "12",
                            "stop_time": "12",
                            "sleepAlertMode": "1",
                            "preWarning": "5",
                            "sleepAlertInterval": "60",
                            "sa_activationSpeed": "40",
                            "startTime": "23",
                            "stopTime": "6",
                            "brakeActivateTime": "10",
                            "braking": "1",
                            "driverEvalMode": "1",
                            "maxLaneChangeThreshold": "0.35",
                            "minLaneChangeThreshold": "-0.35",
                            "maxHarshAccelerationThreshold": "0.25",
                            "minHarshAccelerationThreshold": "-0.4",
                            "suddenBrakingThreshold": "-0.4",
                            "maxSpeedBumpThreshold": "0.5",
                            "minSpeedBumpThreshold": "-0.5",
                            "GovernerMode": "1",
                            "speedLimit": "100",
                            "cruiseMode": "1",
                            "cruiseactivationSpeed": "40",
                            "vehicleType": "1",
                            "obdMode": "1",
                            "protocolType": "0",
                            "tpmsMode": "1",
                            "acceleratorType": "1",
                            "VS_brk_typ": "1",
                            "VS_gyro_type": "1",
                            "lazerMode": "1",
                            "rfSensorMode": "1",
                            "rfAngle": "0",
                            "rdr_act_spd": "40",
                            "rdr_type": "1",
                            "Sensor_res1": "1",
                            "speedSource": "1",
                            "slope": "4.5",
                            "offset": "0.5",
                            "delay": "30",
                            "rfNameMode": "1",
                            "noAlarm": "30",
                            "speed": "30",
                            "accelerationBypass": "10",
                            "tim_err_tpms": "1",
                            "rfSensorAbsent": "60",
                            "gyroscopeAbsent": "60",
                            "hmiAbsent": "60",
                            "timeNotSet": "59",
                            "brakeError": "60",
                            "tpmsError": "60",
                            "obdAbsent": "60",
                            "noAlarmSpeed": "60",
                            "laserSensorAbsent": "60",
                            "rfidAbsent": "60",
                            "iotAbsent": "60",
                            "acc_board": "60",
                            "SBE_dd": "60",
                            "SBE_alcohol": "60",
                            "SBE_temp": "60",
                            "firmwareOtaUpdate": "1",
                            "firewarereserver1": "0",
                            "firewarereserver2": "0",
                            "alcoholDetectionMode": "1",
                            "alcoholinterval": "10",
                            "alcoholact_spd": "40",
                            "alcoholstart_time": "12",
                            "alcoholstop_time": "12",
                            "alcoholmode": "1",
                            "driverDrowsinessMode": "1",
                            "dd_act_spd": "40",
                            "dd_acc_cut": "1",
                            "dd_strt_tim": "12",
                            "dd_stop_tim": "12",
                            "dd_res1": "0",
                            "load_sts": "1",
                            "load_max_cap": "10",
                            "load_acc": "1",
                            "fuelMode": "1",
                            "fuel_tnk_cap": "100",
                            "fuel_intvl1": "0",
                            "fuel_intvl2": "0",
                            "fuel_acc": "1",
                            "fuel_thrsh": "12"
                        },
                        featureset_status : 1 ,
                    }
          
                    const e = cy.wrap(res.body.results);
                      cy.request({
                        method: 'PUT',
                        url: `${featureSetLink}/edit-featureset/${ele.featureset_uuid}`,
                        headers: {
                          authorization: `bearer ${token}`
                        },
                        body: editFeaturesetBody
                      }).then((res)=>{
                        cy.wrap(res.body.message).should('eq', "Successfully featureset updated");
                      });
                    

                  })
                })
          


          });





          //doing it for delete customer--> this would be done in the ending of the testing

          // doing it for logout
          // cy.request({
          //   method: 'GET',
          //   url: `http://localhost:${PORT}/api/customers/logout`,
          //   headers: {
          //     authorization: `bearer ${token}`
          //   }}).then(res=>{
          //     cy.log(res.body.message)
          //   })

        })

      });

    });






    //doing it for delete customer--> this would be done in the ending of the testing

    // doing it for logout
    // cy.request({
    //   method: 'GET',
    //   url: `http://localhost:${PORT}/api/customers/logout`,
    //   headers: {
    //     authorization: `bearer ${token}`
    //   }}).then(res=>{
    //     cy.log(res.body.message)
    //   })


    // customer side
    // customer side
    // customer side
    //kindly add the code for customer panel here only
    cy.request("POST", `http://localhost:${PORT}/api/login`, {
      email: customer_email,
      password: "qwerty"
    }).then((res) => {
      cy.wrap(res.body).should('have.property', 'message', 'Login successful!');
      cy.wrap(res.body.user).should('have.property', 'user_uuid');
      cy.wrap(res.body).should('have.property', 'token');
      const token = res.body.token;
      const user_uuid = res.body.user.user_uuid;

      //remaining code for the customer api's will go here;
      //get all contacts
      let atLink = `http://localhost:${PORT}/api/contacts`;
      cy.request({
        method: 'GET',
        url: `${atLink}/getContacts-all/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res) => {
        cy.wrap(res.body.contacts).each((ele) => {
          cy.wrap(ele).should('have.property', "user_uuid", user_uuid);
          cy.wrap(ele).should('have.property', "contact_uuid");

          //get-contact-by-uuid
          let contact_uuid = ele.contact_uuid;
          cy.request({
            method: 'GET',
            url: `${atLink}/getContactById/${contact_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((e) => {
            cy.wrap(e.body.results).each((result) => {
              cy.wrap(result).should('have.property', 'contact_email')
              cy.wrap(result).should('have.property', 'contact_mobile')
            })
          })
        })
      })

      // savecontact/:user_uuid
      let rn = Math.random().toFixed(1);
      let saveContact = {
        contact_first_name: 'demo',
        contact_last_name: 'i-stark',
        contact_email: customer_email,
        contact_mobile: customer_mobile,
      }

      let editContact = {
        contact_first_name: 'demo',
        contact_last_name: 'i-stark',
        contact_email: `ayush${rn*10}@starkenn.com`,
        contact_mobile: `9955994${rn*10}`,
        contact_status: 1
      }
      cy.request({
        method: 'POST',
        url: `${atLink}/savecontact/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        },
        body: saveContact
      }).then((res) => {
        cy.wrap(res.body.message).should('eq', "Contact added successfully");
      })

      //editContact
      cy.request({
        method: 'PUT',
        url: `${atLink}/editcontact/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        },
        body: editContact
      }).then((res) => {
        cy.wrap(res.body.message).should('eq', "Contacts updated successfully");
      })


      //delete contact
      cy.request({
        method: 'GET',
        url: `${atLink}/getContacts-all/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res) => {
        cy.wrap(res.body.contacts).each((ele) => {
          cy.wrap(ele).should('have.property', "user_uuid", user_uuid);
          cy.wrap(ele).should('have.property', "contact_uuid");

          cy.request({
            method: 'PUT',
            url: `${atLink}/deletecontact/${ele.contact_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            },
            body: {
              user_uuid: user_uuid
            }
          }).then((res) => {
            cy.wrap(res.body.message).should('eq', "Contacts deleted successfully");
          })

          return;

        })
      })
      let atLink1 = `http://localhost:${PORT}/api/profile`;

      //get profile
      cy.request({
        method: 'GET',
        url: `${atLink1}/get-profile/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res) => {
        cy.log(res.body.results)
      })

      //** this function can't be tested due to email */
      // //update profile
      // cy.request({
      //   method: 'PUT',
      //   url: `${atLink1}/update-profile/${user_uuid}`,
      //   headers: { authorization: `bearer ${token}` },
      //   body :{first_name:'demo',
      //     last_name:'starkenn',
      //     email: 'demo@starkenn.com',
      //     company_name:'stark-i',
      //     address:'sanewadi, pune',
      //     state: 'MH',
      //     city: 'MH-14',
      //     pincode:'411021',
      //     phone:'0000998866'}
      // }).then((res)=>{
      //   cy.wrap(res.body.message).should('eq', "User updated successfully");
      // })

      //feature set
      

      let atLink2 = `http://localhost:${PORT}/api/vehicles`;

      //get-all-vehicle vehicle
      cy.request({
        method: 'GET',
        url: `${atLink2}/get-all-vehicles`,
        headers: {
          authorization: `bearer ${token}`
        },
      }).then((e) => {
        cy.wrap(e.body.message).should('eq', "Successfully fetched data");
      })

      //get-user-vehicle list
      cy.request({
        method: 'GET',
        url: `${atLink2}/get-user-vehiclelist/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        },
      }).then((e) => {
        cy.wrap(e.body.message).should('eq', "Successfully got list of all vehicles");
        cy.wrap(e.body.results).each((r) => {
          cy.log(r.vehicle_name)
          //edit vehicle here

          //--on rest cause no featureset uuid is there
          //get featureset with user_uuid
          cy.request({
            method: 'GET',
            url: `${atLink2}/get-user-featureset/${user_uuid}`,
            headers: {
              authorization: `bearer ${token}`
            }
          }).then((res)=>{
            const editVehicleName = {
              user_uuid: user_uuid,
              vehicle_name: 'testing_cypress',
              vehicle_registration: 'MH12ST2034',
              ecu: 'NULL',
              iot: "NULL",
              dms: "DMS_NCL_16",
              featureset_uuid: res.body.results.featureset_uuid,
              vehicle_status: 1,
        }
        cy.request({
          method: 'PUT',
          url: `${atLink2}/edit-vehicle/${r.vehicle_uuid}`,
          headers: { authorization: `bearer ${token}` },
          body: editVehicleName
        })

        //add vehicle
        const addVehicle = {
          user_uuid: user_uuid,
          vehicle_name: 'testing_cypress',
          vehicle_registration: 'MH12ST2034',
          ecu: 'NULL',
          iot: "NULL",
          dms: "DMS_NCL_18",
          featureset_uuid: res.body.results.featureset_uuid,
    }
        cy.request({
          method: 'POST',
          url: `${atLink2}/add-vehicle`,
          headers: { authorization: `bearer ${token}` },
          body: addVehicle
        }).then((ress)=>{
          cy.wrap(ress.body.message).should('eq', "Vehicle added successfully");
        })

        //get vehicle total count;
        cy.request({
          method: 'GET',
          url: `${atLink2}/total-vehicles`,
          headers: { authorization: `bearer ${token}` }
        }).then((result)=>{
          cy.wrap(result.body.message).should('eq', "Successfully received vehicles count.");
        })
        

        //get vehicle data
        cy.request({
          method: 'GET',
          url: `${atLink2}/get-vehicle-details/${vehicle_uuid}`,
          headers: { authorization: `bearer ${token}` }
        }).then((result)=>{
          cy.wrap(result.body.message).should('eq', "Successfully received vehicles count.");
        })

        //delete vehicle
        cy.request({
          method: 'PUT',
          url: `${atLink2}/delete-vehicle/${r.vehicle_uuid}`,
          headers: { authorization: `bearer ${token}` },
          body:{user_uuid: user_uuid}
        }).then((ress)=>{
          cy.wrap(ress.body.message).should('eq', "Successfully vehicle deleted");
        })

        let atLink3 = `http://localhost:${PORT}/api/alert-triggers`;
      
      //alert-trigger
      //save
      const alertBody = {
        trigger_name : "test-1",
        trigger_description: "testing purpose in cypress",
        vehicle_uuid :r.vehicle_uuid ,
        trigger_type: "LIMP",
        selectedContacts: [{recipients:"2818fead-2839-4f2d-926f-c8a2a8be2b57",email:"micky@gmail.com"},{recipients:"90e5c468-939c-4acc-88c1-71d88423835f",email:"donald@gmail.com"},{recipients:"b8b2b7b8-a50f-4f36-bee5-5628ec3ba429",mobile:"7709993272"}],
      }
      cy.request({
        method: 'POST',
        url: `${visitLink}/save-alert-trigger/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        },
        body: alertBody
      }).then(res =>{
          cy.wrap(res.body.message).should('eq', "Successfully saved the alert");
      })

      //get alert trigger using user_uuid
      cy.request({
        method: 'GET',
        url: `${visitLink}/getall-alert-trigger/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then(ress=>{
        cy.wrap(ress.body.message).should('eq', 'Successfully got all the alert');

        //update alert trigger using trigger_id
      cy.request({
        method: 'PUT',
        url: `${visitLink}/update-alert-trigger/${trigger_id}`,
        headers: {
          authorization: `bearer ${token}`
        },
        body: {
          trigger_name : "test-1",
        trigger_description: "testing purpose in cypress using portal",
        vehicle_uuid :r.vehicle_uuid ,
        trigger_type: "LIMP Mode",
        selectedContacts: [{recipients:"2818fead-2839-4f2d-926f-c8a2a8be2b57",email:"micky@gmail.com"},{recipients:"90e5c468-939c-4acc-88c1-71d88423835f",email:"donald@gmail.com"},{recipients:"b8b2b7b8-a50f-4f36-bee5-5628ec3ba429",mobile:"7709993272"}],
        }
      }).then(ress=>{
        cy.wrap(ress.body.message).should('eq', 'Successfully updated the alert');
      })

      //delete trigger
      cy.request({
        method: 'PUT',
        url: `${visitLink}/delete-alert-trigger/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then(RES=>{
        cy.wrap(RES.body.message).should('eq' , "Successfully deleted the alert");
      })
      })

      


      //do alert trigger above this

          })
          
        })
      })


      //almost the whole vehicle is pending;

      //doing it for the dashboard
      //get ongoing trip data
      const visitLink = `http://localhost:${PORT}/api/dashboardCustomers`;
      cy.request({
        method: 'GET',
        url: `${visitLink}/get-ongoing-trip-data/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res)=>{
        cy.wrap(res.body.message).should((message) => {
          expect(message).to.satisfy((value) => {
            // Check if the message is equal to either "statement1" or "statement2"
            return value === "Data fetched successfully!" || value === "Ongoing trip data not found!";
          });
        });
      })

      //get alert
      cy.request({
        method: 'GET',
        url: `${visitLink}/getAlert/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res)=>{
        cy.wrap(res.body.message).should((message) => {
          expect(message).to.satisfy((value) => {
            // Check if the message is equal to either "statement1" or "statement2"
            return value === "Successfully retrieved trip data" || value === "An error occurred while retrieving trip data";
          });
        });
      })

      // get vehicle Logs
      cy.request({
        method: 'GET',
        url: `${visitLink}/getVehicleLogs/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res)=>{
        cy.wrap(res.body.message).should((message) => {
          expect(message).to.satisfy((value) => {
            // Check if the message is equal to either "statement1" or "statement2"
            return value === "Successfully retrieved trip data" || value === "n error occurred while retrieving trip data";
          });
        });
      })

      //getOngoingLOC
      cy.request({
        method: 'GET',
        url: `${visitLink}/getOngoingLoc/${user_uuid}`,
        headers: {
          authorization: `bearer ${token}`
        }
      }).then((res)=>{
        cy.wrap(res.body.message).should((message) => {
          expect(message).to.satisfy((value) => {
            // Check if the message is equal to either "statement1" or "statement2"
            return value === "Successfully retrieved location of latest Vehicle trip data " || value === "An error occurred while retrieving trip data";
          });
        });
      });



      //









      
      // --- write your code for user above this;
    })

  })
})