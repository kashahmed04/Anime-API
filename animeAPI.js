
//variables to hold the display term that the user searched
//as well as the final string and the final results
let displayTerm = "";
let finalString = "";
let finalResults;

/*when the user presses the go button to search we call the associated method
    with the event same for if they clicked the random button
    there are variables for the searchbox and the dropdown
    that shows up when someone searches an anime as well as variables
    for a prefix and a search key and select key for the searchbox and
    dropdown so we can store and get data from local
    storage to put the users previous search in when they come back to the
    page if they had searched something previously. If they had not been to the
    page before the defaults will set which is no previous data being stored
    and the search bar just has the palceholder text. Also,
    if the dropdown is set to A-Z or Z-A we make sure to disable the generate the 
    random anime button and change the innerhtml so the user knows 
    they can't generate a random anime because our sort method takes in 
    objects to sort but we can't sort 1 object so we just disable the feature.
*/

window.onload = (e) => {
    document.querySelector("#gobutton").onclick = searchButtonClicked;
    document.querySelector("#generatebutton").onclick = randomButtonClicked;
    let disabledButton = document.querySelector("#generatebutton");
    const searchField = document.querySelector("#searchterm");
    const searchSelect = document.querySelector("#search");
    const prefix = "kka7705";
    const searchKey = prefix + "searchterm"; 
    const selectKey = prefix + "dropdown";

    searchField.onchange = e => { localStorage.setItem(searchKey, e.target.value); };
    searchSelect.onchange = e => {localStorage.setItem(selectKey, e.target.value);
                                    if(searchSelect.value == "sorta" || searchSelect.value == "sortd"){
                                        disabledButton.innerHTML = "Cannot generate random anime";
                                        disabledButton.disabled = true;
                                    }
                                else{
                                    disabledButton.innerHTML = "Generate Random Anime";
                                    disabledButton.disabled = false;
                                }
                                };

    if (localStorage.getItem(searchKey)) {
        document.querySelector("#searchterm").value = localStorage.getItem(searchKey);
    }

    if (localStorage.getItem(selectKey)){
        document.querySelector("#search").value = localStorage.getItem(selectKey);
        if(searchSelect.value == "sorta" || searchSelect.value == "sortd") {
            disabledButton.innerHTML = "Cannot generate random anime";
            disabledButton.disabled = true;
        }
        else{
            disabledButton.innerHTML = "Generate Random Anime";
            disabledButton.disabled = false;
        }
    }


};

/*If the search button was clicked we set up the variables for the Jikan URL
    as well as the search term the user put in. After we set the display term which was
    the global variable to the search term then trim the search term and get the data
    if we can but if not (invalid search type) then we say there was no data found.
    Also, if there was a search of an empty space we say there was no results found for " ".
    We then dsplay to the user we are getting the data and call the getData method
    to retrieve the data.*/
    
function searchButtonClicked() {
    //console.log("searchButtonClicked() called");//check to see if its working
    let JIKAN_URL = "https://api.jikan.moe/v4/anime";
    let searchTerm = document.querySelector("#searchterm").value;

    displayTerm = searchTerm;

    searchTerm = searchTerm.trim();
    if(searchTerm == ""){
        document.querySelector("p").innerHTML = "<b>No results found for \" " + displayTerm + "\"</b>";
        document.querySelector("#content").innerHTML = "";
        return;
    }

    searchTerm = encodeURIComponent(searchTerm);

    JIKAN_URL = "https://api.jikan.moe/v4/anime?q=";
    JIKAN_URL += searchTerm;

    //console.log("Final URL: ", JIKAN_URL); //show the final url

    document.querySelector("p").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    //console.log(JIKAN_URL);

    getData(JIKAN_URL);

}

/*Creates an XML request to get the data and calls the dataLoaded method if it can get the data.*/

function getData(url) {

    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded;

    xhr.open("GET", url); 

    xhr.send();


}

/*We target the xhr request which is our data we got back then we turn that data into a JS object
    and see if the length is 0 or the data does not exist then we tell the user there
    was no data found for their searchterm and exit the function. Otherwise, we have a switch
    statement for the dropdowns values. If it's a sort by A-Z we set up the sortAZ, otherwise
    if its Z-A we call sortZA and set the final results to the sorted data to then go on
    and display the information and the default is when the user searches by titlein the switch statement. 
    We then loop through the final results which we set in our switch statements 
    to be able to display all of the data. We parse out our information from
    a helper function which is called within the loop for every item then we display all of the items.*/ 

function dataLoaded(e) {

    let xhr = e.target;

    //retrieve the xhr data (the JSON)
    //console.log(xhr.responseText); 

    let obj = JSON.parse(xhr.responseText);

    if (!obj.data || obj.data.length == 0) {
        document.querySelector("p").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return;
    }

    switch (search.value) {
        case "sorta":
            let sortAZ = obj.data.sort((anime1, anime2) => {
                const animeName1 = anime1.title.toUpperCase();
                const animeName2 = anime2.title.toUpperCase();
                if (animeName1 < animeName2) {
                    return -1;
                }
                if (anime1 > animeName2) {
                    return 1;
                }
                return 0;
            });
            finalResults = sortAZ;
            break;
        case "sortd":
            let sortZA = obj.data.sort((anime1, anime2) => {
                const animeName1 = anime1.title.toUpperCase();
                const animeName2 = anime2.title.toUpperCase();
                if (animeName1 > animeName2) {
                    return -1;
                }
                if (anime1 < animeName2) {
                    return 1;
                }
                return 0;
            });
            finalResults = sortZA;
            break;
        default:
            finalResults = obj.data;
            break;


    }

    finalString = "";
    if (finalResults.length == undefined) {
        //console.log("random result found")
        finalString = createAnimeList(finalResults);

        document.querySelector("#content").innerHTML = finalString;
        document.querySelector("p").innerHTML = "<b>Success!</b><p><i>Here are is a random result</i></p>";

    }
    else {
        //console.log("finalResults.length = " + finalResults.length);

        for (let i = 0; i < finalResults.length; i++) {
            let finalResult = finalResults[i];
            finalString += createAnimeList(finalResult); 

        }

        document.querySelector("#content").innerHTML = finalString;
        document.querySelector("p").innerHTML = "<b>Success!</b><p><i>Here are " + finalResults.length + " results for '" + displayTerm + "'</i></p>";
    }

}

/*This gets the data for us if it was many results or just 1 for the random button.
    We create the variable for the image url and get the image, but if there was
    no image found then we set the "not found" image. We then set the url
    variable to the finalresults url then see if the link for the trailer exists.
    If it does not, then we don't create the link, say that there was no trailer
    found for the anime, then just display the image. If the trailer was found,
    we display the link with the image so when the user hovers over the image they can click
    to view the trailer and we let the user know they can click the image to view the trailer.
    If no rating was given we just say that there is no rating. Finally, we
    put all the data together that we parsed then return the display string to the loop.*/

function createAnimeList(finalResults) {
    let imageURL = finalResults.images.jpg.image_url;
    if (!imageURL) {
        imageURL = "../media/No_Image_Available.webp"; 
    }

    let url = finalResults.url;

    let trailer_link = finalResults.trailer.url;
    let trailer_text = "View trailer ↓";
    let trailer_anchor;
    if (trailer_link == null) {
        trailer_link =  ""; 
        trailer_text = "No trailer found";
        trailer_anchor = `<image src = '${imageURL}'/>`;

    }
    else{
        trailer_anchor = `<a target = '_blank' href = ${trailer_link}><image src = '${imageURL}'/></a>`;
    }

    if (finalResults.rating == null) {
        finalResults.rating = "No rating given";

    }

    let line = `<div class='result'>Rating: ${finalResults.rating.toUpperCase()}<br/><p class = 'paragraphs'>${trailer_text}</p>${trailer_anchor}${finalResults.title}`;
    line += `<span><a target = '_blank' href = '${url}'>View on MyAnimeList</a></span></div>`;
    let displayString = line;

    return displayString;

}

/*If the random button was clicked we want to create the link to generate
    a random anime then call the method to retrieve the data and display the random anime.*/

function randomButtonClicked() {
    let randomURL = 'https://api.jikan.moe/v4/random/anime';

    //console.log(randomURL);
    getData(randomURL);

}
