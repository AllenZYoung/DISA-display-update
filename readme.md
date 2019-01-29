## Introduction
A series of JavaScript scripts to change the display for the webpage at http://disa.forkinthecode.com.
## About the JavaScript code
In the [DISA webpage](http://disa.forkinthecode.com), a series of [JavaScript programs (click here to go to the code repository in github!)](https://github.com/paarulsukanya/disa) are used to render the webpage so that the data entries retrieved from database can be showed to users. So far, we are sure about the function of several scripts:

1. person-edit.js is for editing(when you're about to create a new person) the form.
2. disa-table.js is for showing the items in the table (basically, many rows of entries).
3. disa-main.js is a "controller" for the global variables and functions called or used in other js scripts.
4. http://api.disa.forkinthecode.com/options is the API url for retrieving the options(what we have in a drop-down menu while creating or editing a person item). If you want to edit(update) an existing item or new a item and edit it, then the js will request this API and show the options accordingly.

## What's been updated 
There are two scipyts updated so far, "disa-main-updated.js" and "disa-table-updated.js", which are the new versions for disa-main.js and disa-table.js respectively. Comment lines are attached in the code for who are going to use or edit the code. In disa-main, the optionsReceived function is updated, while in disa-table, the __entriesChanged function is changed. Use ctrl-f to search and locate them since the scripts are of approximately 300 lines.

## What's more

Some other scripts like ["dropdown-edit.js"](https://github.com/paarulsukanya/disa/blob/master/src/disa-edit/dropdown-edit.js) sounds like to be reponsible for our editing action, but it turns out that updating the function within these scripts does not really have effect on our display. That's why we have to update the code in disa-main.js.   
More explorations are recommended if you try to change the content of this DISA page.

## Contact
<yangzhang@brown.edu>
