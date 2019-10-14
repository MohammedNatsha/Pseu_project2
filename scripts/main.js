// *** global variables ***

// keep track of select Email
let boxEmail = null;
// default team
let pseu;

// *** Classes ***

// Member is the class which presents a person
class Member
{
    constructor(name,email,major,role,biography,date)
    {
        this.name = name;
        this.email = email.toLowerCase();
        this.major = major;
        this.role = role;
        this.biography = biography;
        this.joinDate = date?date : Date.now();
    }

    // creates UI for the Member Widget
    render()
    {
        return `
        <div class="member-card" >
            <button class="delete-button" data-key = "${this.email}" onclick="UpdateBoxEmail(this);deleteMember()" >
                <span>-</span>
            </button>
            
            <div data-key = "${this.email}"  onclick="ShowRecord(this)">
                <h3>${this.name}</h3>
                <h5>
                    ${this.email} / ${this.major} / ${this.role}
                </h5>
                <p>
                    ${this.biography}
                </p>
            </div>
        </div>
        `   
    }
}

// holds Teams Information and necessary functions
class Team
{
    constructor(name)
    {
        this.name = name;
        this.members = [];
        // Load Data when object created
        this.LoadMembers();
    }

    // Team Modification Functions
    GetMember(email)
    {
        return this.members.find(element => element.email.toLowerCase() == email);
    }

    AddMember(index,member)
    {
        this.members.splice(index,0,member);
        this.SaveMembers();
    }
    
    RemoveMember(email)
    {
        let _targetedIndex = this.members.findIndex(element => element.email == email);
        this.members.splice(_targetedIndex,1);
        this.SaveMembers();
    }

    EditMember(targetedEmail,name,email,major,role,biography)
    {
        let _targetedIndex = this.members.findIndex(element => element.email == targetedEmail);

        // validate the new email after modification
        if(targetedEmail.toLowerCase() != email.toLowerCase() && this.members.findIndex(element => element.email.toLowerCase() == email.toLowerCase()) != -1)
        {
            window.alert("there is already a user with the same email");
            return false;
        }

        this.members[_targetedIndex].name = name;
        this.members[_targetedIndex].email = email;
        this.members[_targetedIndex].major = major;
        this.members[_targetedIndex].role = role;
        this.members[_targetedIndex].biography = biography;

        this.SaveMembers();
        return true;
    }

    // Save and Load Team Information
    SaveMembers()
    {
        localStorage.setItem("Team " + this.name,JSON.stringify(this.members));
    }

    LoadMembers()
    {
       
        if(localStorage.getItem("Team " + this.name) != null)
        {
            this.members = JSON.parse(localStorage.getItem("Team " + this.name));
            for (let i in this.members) 
            {   
                let {name,email,major,role,biography,joinDate} = this.members[i];
                this.members[i] = new Member(name,email,major,role,biography,joinDate);
            }
        }
    }

    // Email Validation
    HasEmail(email)
    {
        return this.members.some((element) => {return element.email.toLowerCase() == email.toLowerCase()});
    }

    // Filters 
    FilterMembers(major,role,search)
    {
        let filtered = this.members;

        if(major != "")
            filtered = filtered.filter(member => member.major == major);

        if(role != "")
            filtered = filtered.filter(member => member.role == role);

        
        filtered = filtered.filter(member => member.name.includes(search));

        return filtered;
    }

    
    // creates UI of the Team Widget
    render(list)
    {
        let listUI = "";
        for (let member of list) 
        {   
            listUI += member.render();
        }

        return listUI;
    }
}

// A sort function that depends on Sort Query
let sorting = (query,array) =>
{
    let _sortFunction;
    // select the function to sort according to 
    if(query == "A-Z")
        _sortFunction = function(a, b){return b.name < a.name};
    else if(query == "Z-A")
        _sortFunction = function(a, b){return b.name > a.name};
    else if(query == "Newest")
        _sortFunction = function(a, b){return b.joinDate > a.joinDate};
    else if(query == "Oldest")
        _sortFunction = function(a, b){return b.joinDate < a.joinDate};
    else
    {
        console.log("invalid sort query");
        return array;
    }

    return array.sort(_sortFunction);
       
}

// Adds Member to the Team
AddMember = () =>
{
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let major = document.getElementById("major").value;
    let role = document.getElementById("role").value;
    let biography = document.getElementById("biography").value;

    // Input validation
    if(!name || !email || !major || !role || !biography)
    {
        ShowError("All fields are Required!");
        return false;
    }

    if(pseu.HasEmail(email))
    {
        ShowError("Email already Exists");
        return false;
    }

    // creates a member and adds it to the team
    let member = new Member(name,email,major,role,biography);
  
    let indx = GetTargetedIndex(pseu);
    
    pseu.AddMember(indx,member)
    
    // Updates the UI
    HideError();
    UpdateUI();
    //ClearForm();
    
    return false;    
}

// Checks where to add the member
GetTargetedIndex = (team) =>
{
    if(document.getElementById("add-to-index").value)
        return Math.min(document.getElementById("add-to-index").value,team.members.length-1);

    if(document.getElementById("add-to-bottom").checked)
        return team.members.length;

    return 0;
}

// select target Member 
let UpdateBoxEmail = (button) =>
{
    boxEmail = button.attributes["data-key"].nodeValue;
}
// deletes the target member
let deleteMember = () =>
{
    pseu.RemoveMember(boxEmail);
    UpdateUI();
    HideRecord();
}
// modifies the targeted member
let ModifyMember = () =>
{
    let name = document.getElementById("record-name").value;
    let email = document.getElementById("record-email").value;
    let major = document.getElementById("record-major").value;
    let role = document.getElementById("record-role").value;
    let biography = document.getElementById("record-biography").value;
    let edited = pseu.EditMember(boxEmail,name,email,major,role,biography); 

    // Updates the UI
    if(edited) HideRecord();
    UpdateUI();
}



// Updates all UI 
let UpdateUI = () =>
{
    // checks filter and sort queries
    let sortQuery = document.getElementById("letter-sort").value;
    let majorQuery = document.getElementById("major-query").value;
    let roleQuery = document.getElementById("role-query").value;
    let nameQuery = document.getElementById("name-query").value;

    // filter and sort the team list
    let queryResult = pseu.FilterMembers(majorQuery,roleQuery,nameQuery);
    queryResult = sorting(sortQuery,queryResult);
    
    // Updates the UI
    document.getElementById("members-list").innerHTML =  pseu.render(queryResult);
    document.getElementById("items-count").innerHTML = queryResult.length + " items";
    document.getElementById("add-to-index").setAttribute("max",pseu.members.length-1);
}

// Clears The form
ClearForm = () =>
{
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("major").value = "";
    document.getElementById("role").value = "";
    document.getElementById("biography").value = "";
    document.getElementById("add-to-index").value = "";
    document.getElementById("add-to-bottom").checked = false;
}

// functions that are related to Pop-up 
// Updates pop-up info
let UpdateRecord = (member) => 
{
    document.getElementById("record-name").value = member.name;
    document.getElementById("record-email").value = member.email;
    document.getElementById("record-major").value = member.major;
    document.getElementById("record-role").value = member.role;
    document.getElementById("record-biography").value = member.biography;
}

// Shows and hides Pop-up
let ShowRecord = (button) =>
{
    let _targetedEmail = button.attributes["data-key"].nodeValue;
    boxEmail = _targetedEmail;
    UpdateRecord(pseu.GetMember(_targetedEmail));
    document.getElementById("record").removeAttribute('style');
}

let HideRecord = () =>
{
    document.getElementById("record").style.display = "none";
    boxEmail = "";
}


// UI related Functions To improve UX

// when checking at bottom checkbox it will nullify the index input
let CheckAtBottom = () =>
{
    document.getElementById("add-to-index").value = "";
}

// when entering an index in index input it will uncheck add-at-bottom checkbox
let atIndex = () =>
{
    document.getElementById("add-to-bottom").checked = false;
    document.getElementById("add-to-index").value = Math.min(document.getElementById("add-to-index").value,team.members.length-1);
}

// Showing Errors in filling the form 
let ShowError = (message) =>
{
    document.getElementById("form-error").innerHTML = message;
}

let HideError = () =>
{
    ShowError("");
}

// Main Function which is Called When Page is fully loaded
let Main  = () => 
{
    pseu = new Team("pseu");  
    UpdateUI();
    // assign functionality to buttons
    document.getElementById("deleteMember").onclick = deleteMember;
    document.getElementById("modifyMember").onclick = ModifyMember;
    document.getElementById("cancel").onclick = HideRecord;
    document.getElementById("add-to-index").onchange = atIndex;
    document.getElementById("add-to-bottom").onclick = CheckAtBottom;
    document.getElementById("letter-sort").onclick = UpdateUI;
    document.getElementById("major-query").onclick = UpdateUI;
    document.getElementById("role-query").onclick = UpdateUI;
    document.getElementById("name-query").addEventListener('keyup',UpdateUI);
}

window.onload = Main;