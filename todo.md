# CHANGE OF PLANS:

```
There won't be any project steps, just projects.
```

# what has left for later

1. auth

- refreshToken;
- restrict appropriate api paths;

2. projects:

- add startTime and endTime, endTime should default to Date.now();
- should be somehow connected to project;

3. projects:

- should be connected to categories

# functionality based approach

1. (LOOKS DONE) artist needs to perform basic auth stuff that is:
   - register
   - log in
1. Artist needs to be able to add new project

   - description:
     ```
     Artist just ended today's session of painting. She needs to take note about that. That's why she opens the app.
     ```
   - artist flow:

     1. Artist opens the app,
     1. Artist sees 'Add project' button on the main page/screen,
     1. Artist sees the form in which there are:

        - dropdown with categories (like 'painting' or 'sketching') along
          with the button to create new category,
        - dropdown with project names along with the button to create new project,
        - time of the start of session,
        - time the session has ended (defaults to NOW),
        - url to the photo of the result of the session,

   - additional info:

     1. categories names are unique,
     1. project names are unique inside of the category,
     1. when user creates new project, she chooses which category
        the project should belong to,

1. Artist needs to be able to browse all the projects she has registered.

   - description:

     ```
     Artist is just chilling on the sofa and thinks "hmmm... let's see all of my work!". Therefore she open the app in order to get all the work she has registered in the app.
     ```

   - artist flow:

     1. Artist opens the app,
     1. Artist sees 'Browse my artworks' button on the main page/screen,
     1. Artist sees the list of favorite categories eg.
        - most time worked on,
        - worked on last,
     1. Artist sees the list of all the categories eg.
        - painting,
        - sketching,
        - photography,
        - sculptures
     1. Artist clicks on any category and is redirected to the page/screen
        containing the list of all the projects in that category (eg. 2 per row),
     1. Whenever artist clicks on a specific project in a category, the preview is shown on the screen. Let's call it the preview mode. The preview contains a carousel containg all of projects from browsed category with selected project being the active carousel item.
     1. User can slide the preview up to make the list of projects be presented as a classic vertical slider on top of the screen with items take about 30%(?) of screen's height. Let's call it transitioning from the preview mode to description mode. The selected project stands out from the rest of them. For simplicity the one selected can have 100% opacity and the other ones- 30% or so. Under that slider the long description is presented in some kind of format. The things that are visible in the description can be:
        - startTime,
        - endTime,
        - time spent,
        - user defined description
     1. When user slides down from description mode, she goes back to carousel mode.
     1. When user slides when being in carousel mode, she closes the whole preview mode,

   -

# further improvements:

1. User doesn't want to manually paste URL to the photo of the result of the session. Instead of that user wants to be redirected to the mobile camera to update take a photo with it or be able to at least upload a file from her phone/pc storage. Ideally those two options would be available;
