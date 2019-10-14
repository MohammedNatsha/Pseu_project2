let boxEmail = null;

class Member
{
    constructor(name,email,major,role,biography,date)
    {
        this.name = name;
        this.email = email;
        this.major = major;
        this.role = role;
        this.biography = biography;
        this.joinDate = date?date : Date.now();
    }

    render()
    {
        return `
        <button class="member-card" data-key = "${this.email}" onclick="ShowRecord(this)">
            <div class="member-icon">
                <div class="member-picture"><span>-</span></div>
            </div>
            <div class="member-information">
                <h3>${this.name}</h3>
                <h5>
                    ${this.email} / ${this.major} / ${this.role}
                </h5>
                <p>
                    ${this.biography}
                </p>
            </div>
        </button>
        `   
    }
}

class Team
{
    constructor(name)
    {
        this.name = name;
        this.members = [];
        this.LoadMembers();
    }

    HasEmail(email)
    {
        return this.members.some((element) => {return element.email == email});
    }

    GetMember(email)
    {
        return this.members.find(element => element.email == email);
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

        if(targetedEmail != email && this.members.findIndex(element => element.email == email) != -1)
        {
            window.alert("there is already a user with the same email");
            return;
        }

        this.members[_targetedIndex].name = name;
        this.members[_targetedIndex].email = email;
        this.members[_targetedIndex].major = major;
        this.members[_targetedIndex].role = role;
        this.members[_targetedIndex].biography = biography;

        this.SaveMembers();
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

    SaveMembers()
    {
        localStorage.setItem("Team " + this.name,JSON.stringify(this.members));
    }
    
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

let sorting = (query,array) =>
{
    let _sortFunction;
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

let pseu;

ClearForm = () =>
{
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("major").value = "";
    document.getElementById("role").value = "";
    document.getElementById("biography").value = "";
}

GetTargetedIndex = (team) =>
{
    if(document.getElementById("add-to-index").value)
        return Math.min(document.getElementById("add-to-index").value,team.members.length-1);

    if(document.getElementById("add-to-bottom").checked)
        return team.members.length;

    return 0;
}

AddMember = () =>
{
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let major = document.getElementById("major").value;
    let role = document.getElementById("role").value;
    let biography = document.getElementById("biography").value;

    if(!name || !email || !major || !role || !biography)
    {
        window.alert("Please fill all informations");
        return false;
    }

    if(pseu.HasEmail(email))
    {
        window.alert("email exists");
        return false;
    }

    let member = new Member(name,email,major,role,biography);
  
    let indx = GetTargetedIndex(pseu);
    
    pseu.AddMember(indx,member);
    UpdateUI();
    
    ClearForm();
    return false;
    
}

let deleteMember = () =>
{
    pseu.RemoveMember(boxEmail);
    UpdateUI();
    HideRecord();
}

let ModifyMember = () =>
{
    let name = document.getElementById("record-name").value;
    let email = document.getElementById("record-email").value;
    let major = document.getElementById("record-major").value;
    let role = document.getElementById("record-role").value;
    let biography = document.getElementById("record-biography").value;
    pseu.EditMember(boxEmail,name,email,major,role,biography); 
    HideRecord();
    UpdateUI();
}

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

let UpdateRecord = (member) => 
{
    document.getElementById("record-name").value = member.name;
    document.getElementById("record-email").value = member.email;
    document.getElementById("record-major").value = member.major;
    document.getElementById("record-role").value = member.role;
    document.getElementById("record-biography").value = member.biography;
}

let CheckAtBottom = () =>
{
    document.getElementById("add-to-index").value = "";
}

let atIndex = () =>
{
    document.getElementById("add-to-bottom").checked = false;
    document.getElementById("add-to-index").value = Math.min(document.getElementById("add-to-index").value,team.members.length-1);
}

let UpdateUI = () =>
{
    let sortQuery = document.getElementById("letter-sort").value;
    let majorQuery = document.getElementById("major-query").value;
    let roleQuery = document.getElementById("role-query").value;
    let nameQuery = document.getElementById("name-query").value;

    let queryResult = pseu.FilterMembers(majorQuery,roleQuery,nameQuery);
    queryResult = sorting(sortQuery,queryResult);
    
    document.getElementById("members-list").innerHTML =  pseu.render(queryResult);
    document.getElementById("items-count").innerHTML = queryResult.length + " items";
    document.getElementById("add-to-index").setAttribute("max",pseu.members.length-1);
}

let Main  = () => 
{
    pseu = new Team("pseu");  
    UpdateUI();
    document.getElementById("add").onclick = AddMember;
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