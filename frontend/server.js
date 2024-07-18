// load the things we need
const express = require('express');
const app = express();
const bodyParser  = require('body-parser');
const path = require("path");

// required module to make calls to a REST API
const axios = require('axios');
app.use(bodyParser.urlencoded());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, "views")); 

// Allow script and css to be used by the webpages
app.use(express.static(path.join(__dirname, "misc")));

// Begin code here

/* 
Notes: 

choice: 
    -> choice variables (will show up when you scroll down) represents a Foreign key. 
    -> Since PK or FK's cannot appear in the webpage, this is the alternative
    -> Function: 
        On the presentation side, it will show the information represented by the FK, 
        On the application side, the value is the actual FK (which is a digit)

EJS Get calls
    -> Will show the most recent added entries
*/

// Home/Login Route
app.get("/", (req, res) => {

    res.render("pages/index");

});

// Process Login; Hardcoded for now
app.post("/process_login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    let login;

    if (username === "admin" && password === "password") {
        login = "y";
    } else {
        login = "n"
    }

    if (login === "y") {
        res.redirect("/dashboard");
    } else {
        res.render("pages/error", {login});
    }

});

app.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

// Facility Webpage
app.get("/facility", (req, res) => {

    axios.get(`http://127.0.0.1:5000/api/facility`)
    .then(response => {
        
        let facility = response.data;
        console.log(facility);
        res.render('pages/entities/facility', {facility});

    })
    .catch(error => {

        let facilityError = "Error fetching facility data from API"

        res.render("pages/error", {
            facilityError
        });

    });
    
});

// Add facility
app.post("/add_facility", (req, res) => {

    const addFacility = req.body;
    console.log(addFacility);

    //Making a POST request to facility API
    axios.post('http://127.0.0.1:5000/api/facility', addFacility)
        .then(response => {
            const addFacilityStatement = response.data
            
            if (addFacilityStatement === "Facility Addition Success") {
                res.redirect("/facility");
            } else {
                res.render("pages/error", {
                    addFacility, 
                    addFacilityStatement,
                    facilityAddError: "Y"
                });
            }
        });
});

// Update facility
app.post("/update_facility", (req, res) => {

    let userFacility = req.body;
    const choice = userFacility["choice"];
    delete userFacility["choice"];

    console.log(`Body ${userFacility["FACILITY_NAME"]}; Choice value: ${choice}`);

    axios.put(`http://127.0.0.1:5000/api/facility/${choice}`, userFacility)
    .then(response => {
        const updateFacilityStatement = response.data;

        if (updateFacilityStatement == `Facility Update Success`) {
            res.redirect("/facility");
        } else {
            res.render("pages/error", {
                userFacility,
                updateFacilityStatement,
                facilityUpdateError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            updateFacilityError: "Error fetching facility data from API"
        })
    });
    
});

// Delete Facility
app.post("/delete_facility", (req, res) => {

    const choice = req.body["choice"];
    console.log(choice);

    axios.delete(`http://127.0.0.1:5000/api/facility/${choice}`)
    .then(response => {
        const deleteFacilityStatement = response.data;

        if (deleteFacilityStatement == `Facility Delete Success`) {
            res.redirect("/facility");
        } else {
            res.render("pages/error", {
                deleteFacilityStatement,
                facilityDeleteError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            deleteFacilityError: "Cannot delete facility: Referenced by other entities in other table"
        })
    });

});

// Classroom
// Classroom Webpage
app.get("/classroom", (req, res) => {

    axios.get(`http://127.0.0.1:5000/api/classroom`)
    .then(classroomResponse => {
        
        let classroom = classroomResponse.data;

        // Callback hell is present here instead of using axios.all due to my database always timing out during 2 simultaneous api calls
        axios.get(`http://127.0.0.1:5000/api/facility`)
        .then(facilityResponse => {

            let facility = facilityResponse.data;

            res.render("pages/entities/classroom", {
                classroom, facility
            });
        })
        .catch(error => {

            let facilityError = "Error fetching facility data from API"

            res.render("pages/error", {
                facilityError
            });
    
        });

    })
    .catch(error => {

        let classroomError = "Error fetching classroom data from API"

        res.render("pages/error", {
            classroomError
        });

    });
    
});

// Add classroom
app.post("/add_classroom", (req, res) => {

    const addClassroom = req.body;
    console.log(addClassroom);

    axios.post('http://127.0.0.1:5000/api/classroom', addClassroom)
        .then(response => {
            const addClassroomStatement = response.data
            
            if (addClassroomStatement === "Classroom addition success") {
                res.redirect("/classroom");
            } else {
                res.render("pages/error", {
                    addClassroom, 
                    addClassroomStatement,
                    classroomAddError: "Y"
                });
            }
        });
});

// Update classroom
app.post("/update_classroom", (req, res) => {
    let userClassroom = req.body;
    const choice = userClassroom["choice"];
    delete userClassroom["choice"];

    // Deletes inputs not provided by the user
    for (let key in userClassroom) {
        if (userClassroom[key].trim() === '') {
            delete userClassroom[key]; // Remove the property if its value is empty or whitespace
        } 
    }

    axios.put(`http://127.0.0.1:5000/api/classroom/${choice}`, userClassroom)
    .then(response => {
        const updateClassroomStatement = response.data;

        if (updateClassroomStatement == `Classroom Update success`) {
            res.redirect("/classroom");
        } else {
            res.render("pages/error", {
                userClassroom,
                updateClassroomStatement,
                classroomUpdateError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            updateClassroomError: "Error fetching facility data from API"
        });
    });
});


// Delete Classroom
app.post("/delete_classroom", (req, res) => {

    const choice = req.body["choice"];
    console.log(choice);

    axios.delete(`http://127.0.0.1:5000/api/classroom/${choice}`)
    .then(response => {
        const deleteClassroomStatement = response.data;

        if (deleteClassroomStatement == `Classroom Delete Success`) {
            res.redirect("/classroom");
        } else {
            res.render("pages/error", {
                deleteClassroomStatement,
                classroomDeleteError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            deleteClassroomError: "Cannot delete classroom: Referenced by other entities in other table"
        });
    });

});

// Teacher
// Teacher Webpage
app.get("/teacher", (req, res) => {

    axios.get(`http://127.0.0.1:5000/api/teacher`)
    .then(teacherResponse => {
        
        // Callback hell is present here instead of using axios.all due to my database always timing out during 2 simultaneous api calls
        axios.get(`http://127.0.0.1:5000/api/classroom`)
        .then(classroomResponse => {

            let teacher = teacherResponse.data;
            let classroom = classroomResponse.data;
            
            res.render("pages/entities/teacher", {
                teacher, classroom
            });
        })
        .catch(error => {

            let classroomError = "Error fetching classroom data from API"

            res.render("pages/error", {
                classroomError
            });
    
        });

    })
    .catch(error => {

        let teacherError = "Error fetching teacher data from API"

        res.render("pages/error", {
            teacherError
        });

    });
    
});

// Add teacher
app.post("/add_teacher", (req, res) => {

    const addTeacher = req.body;
    console.log(addTeacher);

    axios.post('http://127.0.0.1:5000/api/teacher', addTeacher)
        .then(response => {
            const addTeacherStatement = response.data
            
            if (addTeacherStatement == "Teacher addition success") {
                res.redirect("/teacher");
            } else {
                res.render("pages/error", {
                    addTeacher, 
                    addTeacherStatement,
                    teacherAddError: "Y"
                });
            }
        });
});

// Update teacher
app.post("/update_teacher", (req, res) => {
    let userTeacher = req.body;
    const choice = userTeacher["choice"];
    delete userTeacher["choice"];

    // Deletes inputs not provided by the user
    for (let key in userTeacher) {
        if (userTeacher[key].trim() === '') {
            delete userTeacher[key]; // Remove the property if its value is empty or whitespace
        } 
    }

    axios.put(`http://127.0.0.1:5000/api/teacher/${choice}`, userTeacher)
    .then(response => {
        const updateTeacherStatement = response.data;

        if (updateTeacherStatement == `Update success`) {
            res.redirect("/teacher");
        } else {
            res.render("pages/error", {
                userTeacher,
                updateTeacherStatement,
                teacherUpdateError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            updateTeacherError: "Error fetching teacher data from API"
        });
    });
});

// Delete Teacher
app.post("/delete_teacher", (req, res) => {

    const choice = req.body["choice"];
    console.log(choice);

    axios.delete(`http://127.0.0.1:5000/api/teacher/${choice}`)
    .then(response => {
        const deleteTeacherStatement = response.data;

        if (deleteTeacherStatement == `Delete Teacher Success`) {
            res.redirect("/teacher");
        } else {
            res.render("pages/error", {
                deleteTeacherStatement,
                teacherDeleteError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            deleteTeacherError: "Cannot delete teacher: Referenced by other entities in other table"
        });
    });

});

// Child
// Child Webpage
app.get("/child", (req, res) => {

    axios.get(`http://127.0.0.1:5000/api/child`)
    .then(childResponse => {
        
        // Callback hell is present here instead of using axios.all due to my database always timing out during 2 simultaneous api calls
        axios.get(`http://127.0.0.1:5000/api/classroom`)
        .then(classroomResponse => {

            let child = childResponse.data;
            let classroom = classroomResponse.data;
            
            res.render("pages/entities/child", {
                child, classroom
            });
        })
        .catch(error => {

            let classroomError = "Error fetching classroom data from API"

            res.render("pages/error", {
                classroomError
            });
    
        });

    })
    .catch(error => {

        let childError = "Error fetching child data from API"

        res.render("pages/error", {
            childError
        });

    });
    
});

// Add child
app.post("/add_child", (req, res) => {

    const addChild = req.body;
    console.log(addChild);

    axios.post('http://127.0.0.1:5000/api/child', addChild)
        .then(response => {
            const addChildStatement = response.data
            
            if (addChildStatement == "Child addition success") {
                res.redirect("/child");
            } else {
                res.render("pages/error", {
                    addChild, 
                    addChildStatement,
                    childAddError: "Y"
                });
            }
        });
});

// Update child
app.post("/update_child", (req, res) => {
    let userChild = req.body;
    const choice = userChild["choice"];
    delete userChild["choice"];

    // Deletes inputs not provided by the user
    for (let key in userChild) {
        if (userChild[key].trim() === '') {
            delete userChild[key]; // Remove the property if its value is empty or whitespace
        } 
    }

    axios.put(`http://127.0.0.1:5000/api/child/${choice}`, userChild)
    .then(response => {
        const updateChildStatement = response.data;

        if (updateChildStatement == `Update success`) {
            res.redirect("/child");
        } else {
            res.render("pages/error", {
                userChild,
                updateChildStatement,
                childUpdateError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            updateChildError: "Error fetching child data from API"
        });
    });
});

// Delete Child
app.post("/delete_child", (req, res) => {

    const choice = req.body["choice"];
    console.log(choice);

    axios.delete(`http://127.0.0.1:5000/api/child/${choice}`)
    .then(response => {
        const deleteChildStatement = response.data;

        if (deleteChildStatement == `Delete Child Success`) {
            res.redirect("/child");
        } else {
            res.render("pages/error", {
                deleteChildStatement,
                childDeleteError: "Y"
            });
        }
    
    })
    .catch(error => {
        res.render("pages/error", {
            deleteChildError: "Cannot delete child: Referenced by other entities in other table"
        });
    });

});

// Start the express application on port 8080 and print server start message
const port = 8080;
app.listen(port, () => console.log("Application started and listening on port 8080"));