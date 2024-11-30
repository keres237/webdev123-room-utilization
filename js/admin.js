$(document).ready(function () { 

  // Function to close the modal
  function closeModal(modal) {
      const modalElement = modal[0]; // Get the first DOM element from the jQuery object
      modalElement.classList.remove('active'); // Remove active class
      modalElement.style.display = 'none'; // Set display to none
  }

  // Event listener for navigation links
  $(".nav-link").on("click", function (e) {
    e.preventDefault(); // Prevent default anchor click behavior
    $(".nav-link").removeClass("link-active"); // Remove active class from all links
    $(this).addClass("link-active"); // Add active class to the clicked link

    let url = $(this).attr("href"); // Get the URL from the href attribute
    window.history.pushState({ path: url }, "", url); // Update the browser's URL without reloading
  });

  //burger-sidebar Event Listener
  $("#burger").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    
     // Disable the button to prevent multiple clicks
     $(this).prop('disabled', true);

     // delay before logic
     setTimeout(function(){
         var sidebar = $("#sidebar");
         var navLabel = $(".sidebar-button-text.ms-2");
         var content = $(".content-page.px-3");
 
         if (sidebar.width() === 260) {
             sidebar.addClass("collapsed");
             navLabel.toggle();
             content.css("margin-left", "70px");
         } else {
             sidebar.removeClass("collapsed");
             navLabel.toggle();
             content.css("margin-left", "260px");
         }
 
         // Re-enable the button after the action
         $("#burger").prop('disabled', false);
     }, 300); //0.3 secs

  });

  
  //SIDE BAR NAVIGATION LINK BUTTON
  // Event listener for the dashboard link
  $("#roomlist-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewroomList(); // Call the function to load analytics
  });

  // Event listener for the products link
  $("#roomstatus-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewroomStatus(); // Call the function to load products
  });

  $("#products-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewProducts(); // Call the function to load products
  });


  // Determine which page to load based on the current URL
  let url = window.location.href;
  if (url.endsWith("room-list")) {
    $("#roomlist-link").trigger("click"); // Trigger the dashboard click event
  } else if (url.endsWith("room-status")) {
    $("#roomstatus-link").trigger("click"); // Trigger the roomstatus click 
  } else if (url.endsWith("products")) {
    $("#products-link").trigger("click"); // Trigger the products click event
  } else {
    $("#roomlist-link").trigger("click"); // Default to dashboard if no specific page
  }

  // Function to load analytics view
  function viewroomList() {
    $.ajax({
      type: "GET", // Use GET request
      url: "viewroomlist.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
         // Call function to load the chart

        var table = $("#table-room-list").DataTable({
          dom: "rtp",
          pageLength: 10,
          ordering: false
        });
        
        // Bind change event for room name filter
        $("#roomname-filter").on("change", function () {
          if (this.value !== "choose") {
            table.column(1).search(this.value).draw(); // Filter by room name (column 1)
          } else {
            // Clear the filter for the room name column if "choose" is selected
            table.column(1).search('').draw();
          }
        });
        
        // Bind change event for room type filter
        $("#roomtype-filter").on("change", function () {
          if (this.value !== "choose") {
            table.column(2).search(this.value).draw(); // Filter by room type (column 2)
          } else {
            // Clear the filter for the room type column if "choose" is selected
            table.column(2).search('').draw();
          }
        });

        // Bind custom input to DataTable search
        $("#custom-search").on("keyup", function () {
          table.search(this.value).draw(); // Search room based on input
        });

        $("#add-room").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          addRoom(); // Call function to add product
        });

        $(".room-status").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          // editRoom(); // Call the function to load products
        });

        $(".room-schedule").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          // editRoom(); // Call the function to load products
        });

        $(".edit-room").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
      
          const button = $(this); // Reference to the clicked button
          button.prop("disabled", true); // Disable the button
      
           // Call the AJAX function
          // editRoom(this.dataset.id);

          // Call the AJAX function
          editRoom(this.dataset.id).always(function() {
            button.prop("disabled", false); // Re-enable the button after AJAX completes
          });


        });
        
      },
    });
  }

  function viewroomStatus() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/viewclass-status.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area

        // Get the select element
        const selectDay = document.getElementById("day");

        // Function to set the current day in the dropdown, real time
        function setCurrentDay() {
          const options = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayIndex = new Date().getDay(); // Get current day index (0-6)
          const currentDay = options[currentDayIndex]; // Get current day name

          // Set the dropdown value to the current day
          selectDay.value = currentDay;
          fetchDayData(); // Fetch data for the current day
        }

        function fetchDayData() {
          const selectedDay = selectDay.value;
          console.log("Selected option:", selectedDay);

          // Make an AJAX call to fetch data based on the selected day
          $.ajax({
              type: "POST", // Use POST request
              url: "../fetch-data/fetch-scheduled-classday.php", // URL to your PHP script that handles the request
              data: { fweek_day: selectedDay }, // Send selected day as data
              success: function(response) {
                  // Update the table body with the fetched data
                  $("#table-room-status tbody").html(response);
              },
              error: function(xhr, status, error) {
                  console.error("Error fetching data:", error);
              }
          });
        }
        setCurrentDay();

        selectDay.addEventListener("change", fetchDayData);

        var table = $("#table-room-status").DataTable({
            dom: "rtp", // Set DataTable options
            pageLength: 10, // Default page length
            ordering: false, // Disable ordering
        });
    
        // Bind custom input to DataTable search
        $("#custom-search").on("keyup", function () {
          table.search(this.value).draw(); // Search room based on input
        });

        // Form room field event listener
        $("#room-form").on("submit", function (e) {
            e.preventDefault(); // Prevent default behavior
    
            // Get values from the dropdowns
            const roomName = $('#room-name-filter').val();
            const roomType = $('#room-type-filter').val();
            const status = $('#room-status-filter').val();
            const action = e.originalEvent.submitter.value; // Get the value of the button that triggered the submit

            // Debugging: Log the retrieved values
            console.log("Room Name:", roomName, "Room Type:", roomType, "Status:", status, "Action:", action);
            // Clear previous filters
            table.search('').columns().search('').draw();
    
            if (action === "filter") {
                // Apply filters based on selected values
                if (roomName && roomName !== "choose") {
                    table.column(1).search(roomName); // Filter by room name (column 1)
                }
    
                if (roomType && roomType !== "choose") {
                    table.column(2).search(roomType); // Filter by room type (column 2)
                }
    
                if (status && status !== "choose") {
                    table.column(9).search(status); // Filter by status (column 3)
                }
                // Redraw the table after setting the filters
                table.draw();
            } else if (action === "all") {
                // Logic to show all records or reset filters
                table.search('').columns().search('').draw(); // Clear all filters
            }
        });
        
        // Form subject-section field event listener
        $("#class-form").on("submit", function (e) {
          e.preventDefault(); // Prevent default behavior
  
          // Get values from the dropdowns
          const subjectCode = $('#subject-code-filter').val();
          const subjectType = $('#subject-type-filter').val();
          const section = $('#section-filter').val();
          const action = e.originalEvent.submitter.value; // Get the value of the button that triggered the submit

          // Debugging: Log the retrieved values
          console.log("Subject Code:", subjectCode, "Subject Type:", subjectType, "Section:", section, "Action:", action);
          // Clear previous filters
          table.search('').columns().search('').draw();
  
          if (action === "filter") {
              // Apply filters based on selected values
              if (subjectCode && subjectCode !== "choose") {
                  table.column(3).search(subjectCode); // Filter by subject code (column 1)
              }
  
              if (subjectType && subjectType !== "choose") {
                  table.column(4).search(subjectType); // Filter by subject type (column 2)
              }
  
              if (section && section !== "choose") {
                  table.column(5).search(section); // Filter by section (column 3)
              }
              // Redraw the table after setting the filters
              table.draw();
          } else if (action === "all") {
              // Logic to show all records or reset filters
              table.search('').columns().search('').draw(); // Clear all filters
          }
        });

         // Call function to load the chart
         $("#add-room-status").on("click", function (e) {
           e.preventDefault(); // Prevent default behavior
          addroomStatus(); // Call function to add status
         });
         
        $(".room-schedule").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          //viewschedule(); // Call the function to view class schedule
        });

        $(".room-status").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          // statusChange(); // Call the function to occupy or unoccupy a room
        });

        $(".edit-room-status").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
      
          const button = $(this); // Reference to the clicked button
          button.prop("disabled", true); // Disable the button
      
          // Call the AJAX function
          // editroomStatus(this.dataset.id).always(function() {
          //     // Re-enable the button after the AJAX call completes
          //     button.prop("disabled", false);
          // });
        });
        
      },
    });
  }


  $(".room-status").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewroomList(); // Call the function to load products
  });

  
  // Function to show the add product modal
  function editRoom(roomId) {
    return $.ajax({
      type: "GET", // Use GET request
      url: "../admin/roomlist/edit.php?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id", roomId);

        const modal = $('#staticBackdrop');
        
        fetchroomlistRecord(roomId);
        fetchroomType();

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-edit-room").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          updateRoom(roomId); // Call function to save product
        });
      },
    });
  }

  //updateRoom
  function updateRoom(roomId) {
    $.ajax({
      type: "POST", // Use POST request
      url: `../admin/roomlist/update-room.php?id=${roomId}`, // URL for saving room
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.nameErr) {
            $("#room-name").addClass("is-invalid"); // Mark field as invalid
            $("#room-name").next(".invalid-feedback").text(response.nameErr).show(); // Show error message
          } else {
            $("#room-name").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.typeErr) {
            $("#room-type").addClass("is-invalid");
            $("#room-type")
              .next(".invalid-feedback")
              .text(response.typeErr)
              .show();
          } else {
            $("#room-type").removeClass("is-invalid");
          }
          
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload products to show new entry
          viewroomList();
        }
      },
    });
  }

  //function to show the add room modal
  function addRoom() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../admin/roomlist/add.html?v=" + new Date().getTime(), // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container").html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal

        const modal = $('#staticBackdrop');

        fetchroomType(); // Load room type for the select input

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-add-room").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          saveRoom(); // Call function to save product
        });
      },
    });
  }

  // Function to save a new room
  function saveRoom(){
    $.ajax({
      type: "POST", // Use POST request
      url: "../admin/roomlist/save-room.php", // URL for saving room
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.nameErr){
            $("#room-name").addClass("is-invalid"); // Mark field as invalid
            $("#room-name").next(".invalid-feedback").text(response.nameErr).show(); // Show error message
          } else {
            $("#room-name").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.typeErr) {
            $("#room-type").addClass("is-invalid");
            $("#room-type")
              .next(".invalid-feedback")
              .text(response.typeErr)
              .show();
          } else {
            $("#room-type").removeClass("is-invalid");
          }
          
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomList();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save room.php.');
        console.error("Error saving php room:", status, error);
      }

    });
  }

  //add room status
  function addroomStatus() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/add-status.html?v=" + new Date().getTime(), // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container1").html(view); // Load the modal view
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        
        const modal = $('#staticBackdrop');

        
        fetchroomName();//fetchroomname list
        fetchSubject();//fetchsubject
        fetchSection();//fetchsection
        fetchTeacher();

       
        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-add").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          //saveroomStatus(); // Call function to save product
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }



  function saveroomStatus(){
    $.ajax({
      type: "POST", // Use POST request
      url: "../admin/roomlist/save-room.php", // URL for saving room
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.nameErr){
            $("#room-name").addClass("is-invalid"); // Mark field as invalid
            $("#room-name").next(".invalid-feedback").text(response.nameErr).show(); // Show error message
          } else {
            $("#room-name").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.typeErr) {
            $("#room-type").addClass("is-invalid");
            $("#room-type")
              .next(".invalid-feedback")
              .text(response.typeErr)
              .show();
          } else {
            $("#room-type").removeClass("is-invalid");
          }
          
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomList();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save room.php.');
        console.error("Error saving php room:", status, error);
      }

    });
  }

  // Function to fetch room type
  function fetchroomType(){
    $.ajax({
      url: "../fetch-data/fetch-roomtype.php", // URL for fetching categories
      type: "GET", // Use GET request
      dataType: "json", // Expect JSON response
      success: function (data) {
        // Clear existing options and add a default "Select" option
        $("#room-type").empty().append('<option value="">--Select--</option>');

        // Append each category to the select dropdown
        $.each(data, function (index, room) {
          $("#room-type").append(
            $("<option>", {
              value: room.type_id, // Value attribute
              text: room.r_type // Displayed text
            })
          );
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching room type:", error);
        alert('Failed to fetch roomtype.');
      }
    });
  }

  //function to fetch record list of room
  function fetchroomlistRecord(roomId) {
    $.ajax({
      url: `../fetch-data/fetch-room.php?id=${roomId}`, // URL for fetching room
      dataType: "json", // Expect JSON response
      success: function (room) {
        $("#room-name").val(room.room_name); // val(name of var initialized within fetch-room.php  .   refers to room.class.php query var)
        $("#room-type").val(room.type_id).trigger("change"); //
      },

      error: function (xhr, status, error) {
        alert('Failed to fetch roomlist.');
        console.error("Error fetching roomlist:", status, error);
      }
    });
  }

  //function to fetch room name, goes to roomlist folder, fetch-room-name
  function fetchroomName() {
    $.ajax({
        url: "../fetch-data/fetch-room-name.php", // URL for fetching categories
        type: "GET", // Use GET request
        dataType: "json", // Expect JSON response
        success: function (data) {
            const dropdownList = $('#dropdown-list-name');
            dropdownList.empty(); // Clear existing options
            
            // Append each category to the dropdown list
            $.each(data, function (index, room){
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name, // Displayed text
                      'data-value': room.room_name // Value attribute
                  })
              );
            });
            
            // Open dropdown on input click
            $('#dropdown-room').on('click', function(event) {
              event.stopPropagation(); // Prevent click from bubbling
              // Close other dropdowns
              $('.dropdown-list').not(dropdownList).hide();
              dropdownList.toggle(); // Toggle the current dropdown
              filterItems(); // Reset display based on current input
            });


            // Filter items based on input
            $('#dropdown-room').on('input', function() {
              filterItems();
            });

            // Select an item and update the input value
            dropdownList.on('click', 'div', function(event) {
              event.stopPropagation(); // Prevent click from bubbling
              $('#dropdown-room').val($(this).data('value'));
              dropdownList.hide();  // Close dropdown
            });

            // Function to filter items
            function filterItems() {
              const filter = $('#dropdown-room').val().toLowerCase();
              let hasVisibleItems = false;

              dropdownList.children('div').each(function() {
                const item = $(this);
                if (item.text().toLowerCase().includes(filter)) {
                    item.show(); // Show item
                    hasVisibleItems = true;
                } else {
                    item.hide(); // Hide item
                }
              });

              // Show or hide the dropdown if there are visible items
              dropdownList.toggle(hasVisibleItems); 
            }

            // Close dropdown when clicking outside
            $(document).on('click', function(event) {
              if (!$(event.target).closest('.dropdown').length) {
                  dropdownList.hide();
              }
            });
        },
        error: function (xhr, status, error) {
          console.error("Error fetching room:", error);
          alert('Failed to fetch room.');
        }
    });
  }

  function fetchSubject() {
    $.ajax({
        url: "../fetch-data/fetch-subject.php", // URL for fetching categories
        type: "GET", // Use GET request
        dataType: "json", // Expect JSON response
        success: function (data) {
          const dropdownList = $('#dropdown-list-subject');
          dropdownList.empty(); // Clear existing options
          
          // Append each category to the dropdown list
          $.each(data, function (index, subject) {
            dropdownList.append(
              $("<div>", {
                text: subject.subject_option, // Displayed text
                'data-value': subject.subject_option // Value attribute
              })
            );
          });
          
          // Open dropdown on input click
          $('#dropdown-subject').on('click', function(event) {
            event.stopPropagation(); // Prevent click from bubbling
            // Close other dropdowns
            $('.dropdown-list').not(dropdownList).hide(); 
            dropdownList.toggle();
            filterItems(); // Reset display based on current input
          });

          // Filter items based on input
          $('#dropdown-subject').on('input', function() {
            filterItems();
          });

          // Select an item and update the input value
          dropdownList.on('click', 'div', function(event) {
            event.stopPropagation(); // Prevent click from bubbling
            $('#dropdown-subject').val($(this).data('value')); // Keep focus for further searching
            dropdownList.hide(); // Close dropdown
          });

          // Function to filter items
          function filterItems() {
            const filter = $('#dropdown-subject').val().toLowerCase();
            let hasVisibleItems = false;

            dropdownList.children('div').each(function() {
              const item = $(this);
              if (item.text().toLowerCase().includes(filter)) {
                  item.show(); // Show item
                  hasVisibleItems = true;
              } else {
                  item.hide(); // Hide item
              }
            });

            // Show or hide the dropdown if there are visible items
            dropdownList.toggle(hasVisibleItems); 
          }

          // Close dropdown when clicking outside
          $(document).on('click', function(event) {
            if (!$(event.target).closest('.dropdown').length) {
              dropdownList.hide();
            }
          });
        },
      error: function (xhr, status, error) {
        console.error("Error fetching subject:", error);
        alert('Failed to fetch subject.');
      }
    });
  }
  
  function fetchSection() {
    $.ajax({
      url: "../fetch-data/fetch-section.php", // URL for fetching categories
      type: "GET", // Use GET request
      dataType: "json", // Expect JSON response
      success: function (data) {
        const dropdownList = $('#dropdown-list-section');
        dropdownList.empty(); // Clear existing options
        
        // Append each category to the dropdown list
        $.each(data, function (index, section) {
          dropdownList.append(
            $("<div>", {
              text: section.section_name, // Displayed text
              'data-value': section.section_name // Value attribute
            })
          );
        });
        
        // Open dropdown on input click
        $('#dropdown-section').on('click', function(event) {
          event.stopPropagation(); // Prevent click from bubbling
          // Close other dropdowns
          $('.dropdown-list').not(dropdownList).hide(); 
          dropdownList.toggle();
          filterItems(); // Reset display based on current input
        });

        // Filter items based on input
        $('#dropdown-section').on('input', function() {
          filterItems();
        });

        // Select an item and update the input value
        dropdownList.on('click', 'div', function(event) {
          event.stopPropagation(); // Prevent click from bubbling
          $('#dropdown-section').val($(this).data('value')); // Set input value to selected item
          dropdownList.hide(); // Close dropdown
        });

        // Function to filter items
        function filterItems() {
          const filter = $('#dropdown-section').val().toLowerCase();
          let hasVisibleItems = false;

          dropdownList.children('div').each(function() {
            const item = $(this);
            if (item.text().toLowerCase().includes(filter)) {
              item.show(); // Show item
              hasVisibleItems = true;
            } else {
              item.hide(); // Hide item
            }
          });

          // Show or hide the dropdown if there are visible items
          dropdownList.toggle(hasVisibleItems); 
        }

        // Close dropdown when clicking outside
        $(document).on('click', function(event) {
          if (!$(event.target).closest('.dropdown').length) {
            dropdownList.hide();
          }
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching section:", error);
        alert('Failed to fetch section.');
      }
    });
  }

  function fetchTeacher() {
    $.ajax({
        url: "../fetch-data/fetch-teacher.php", // URL for fetching categories
        type: "GET", // Use GET request
        dataType: "json", // Expect JSON response
        success: function (data) {
          const dropdownList = $('#dropdown-list-teacher');
          dropdownList.empty(); // Clear existing options
          
          // Append each category to the dropdown list
          $.each(data, function (index, teacher) {
            dropdownList.append(
              $("<div>", {
                text: teacher.teacher_assigned, // Displayed text
                'data-value': teacher.teacher_assigned // Value attribute
              })
            );
          });
          
            // Open dropdown on input click
          $('#dropdown-teacher').on('click', function(event) {
            event.stopPropagation(); // Prevent click from bubbling
            // Close other dropdowns
            $('.dropdown-list').not(dropdownList).hide(); 
            dropdownList.toggle();
            filterItems(); // Reset display based on current input
          });

          // Filter items based on input
          $('#dropdown-teacher').on('input', function() {
            filterItems();
          });

          // Select an item and update the input value
          dropdownList.on('click', 'div', function(event) {
            event.stopPropagation(); // Prevent click from bubbling
            $('#dropdown-teacher').val($(this).data('value')); // Set input value to selected item
            dropdownList.hide(); // Close dropdown
          });

          // Function to filter items
          function filterItems() {
            const filter = $('#dropdown-teacher').val().toLowerCase();
            let hasVisibleItems = false;

            dropdownList.children('div').each(function() {
              const item = $(this);
              if (item.text().toLowerCase().includes(filter)) {
                item.show(); // Show item
                hasVisibleItems = true;
              } else {
                item.hide(); // Hide item
              }
            });

            // Show or hide the dropdown if there are visible items
            dropdownList.toggle(hasVisibleItems); 
          }

          // Close dropdown when clicking outside
          $(document).on('click', function(event) {
            if (!$(event.target).closest('.dropdown').length) {
              dropdownList.hide();
            }
          });
        },
        error: function (xhr, status, error) {
          console.error("Error fetching Teacher:", error);
          alert('Failed to fetch Teacher.');
        }
    });
  }


});
