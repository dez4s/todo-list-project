import { projectsManager, createProject } from './projectsManager';
import { renderProject, renderAllItems, renderTodaysItems, renderThisWeekItems } from './manageDOM.js'
import { createButton, createDivContainer, createTextElem, createLabel, createInput, createMaterialIcon } from './DOMElementCreationMethods';
import { toggleNavContainer } from './toggleSideNavMenu.js';

const backdrop = document.querySelector('#backdrop');
const toggleNavIfBackdropIsVisible = () => {
    const isBackDropVisible = window.getComputedStyle(backdrop).display === 'block';
    if (isBackDropVisible) toggleNavContainer.toggleNavHidden();
};

const createNavElement = () => {
    const nav = document.createElement('nav');

    const quickNavContainer = createDivContainer('nav-container', 'quick-nav-container', nav);
    const allItemsBtn = createButton('All', 'quick-nav-btn', '', quickNavContainer);
    const todayItemsBtn = createButton('Today', 'quick-nav-btn', '', quickNavContainer);
    const thisWeekItemsBtn = createButton('This week', 'quick-nav-btn', '', quickNavContainer);

    createTextElem('h2', 'My projects', nav);

    const projectCreateContainer = createDivContainer('project-create', '', nav);
    projectCreateContainer.classList.add('modal-container');
    const openProjectCreateModal = createButton('New project', 'open-modal-button', '', projectCreateContainer);
    openProjectCreateModal.classList.add('new-item-button');
    createMaterialIcon('add', openProjectCreateModal, true);
    const projectModal = document.createElement('dialog');
    projectCreateContainer.appendChild(projectModal);
    const createProjectForm = document.createElement('form');
    projectModal.appendChild(createProjectForm);
    createProjectForm.method = 'dialog';
    createLabel('projectTitle', 'Project title: ', createProjectForm);
    const inputProjectTitle = createInput('text', 'projectTitle', 'projectTitle', true, '', createProjectForm);
    const cancelBtn = createButton('Cancel', 'cancel-button', '', createProjectForm);
    const createProjectBtn = createButton('Confirm', 'submit-button','', createProjectForm);
    cancelBtn.type = 'button';

    const projectsNavContainer = createDivContainer('nav-container', 'projects-nav-container', nav);

    const projectBtnHandler = (project) => {
        console.log(project);
        renderProject(project);

        toggleNavIfBackdropIsVisible()
    };

    const createNavItem = (project) => {
        const projectBtnContainer = createDivContainer('project-btn-container', '', projectsNavContainer);

        projectBtnContainer.dataset.projectIndex = projectsManager.projectsArr.indexOf(project);

        const projectBtn = createButton(project.title, 'nav-project-button', '', projectBtnContainer);
        projectBtn.addEventListener('click', () => {
            projectBtnHandler(project);
        });

        return projectBtn;
    };

    function createEditProjectTitleButton(index, project) {        
        const editProjectTitleContainer = createDivContainer('modal-container', '', '');

        const targetContainer = Array.from(document.querySelectorAll('.project-btn-container')).find(elem => elem.dataset.projectIndex == index);

        targetContainer.appendChild(editProjectTitleContainer)

        editProjectTitleContainer.classList.add('edit-project-title-modal');

        const openEditProjectTitleModal = createButton('', 'open-modal-button', '', editProjectTitleContainer);
        createMaterialIcon('mode_edit', openEditProjectTitleModal);
        const editProjectTitleModal = document.createElement('dialog');
        editProjectTitleContainer.appendChild(editProjectTitleModal);
        const editProjectTitleForm = document.createElement('form');
        editProjectTitleForm.method = 'dialog';
        createLabel('editProjectTitleTitle', 'Project title', editProjectTitleForm);
        const editProjectTitleTitleInput = createInput('text', 'editProjectTitleTitle', 'editProjectTitleTitle', true, '', editProjectTitleForm);
        editProjectTitleTitleInput.readOnly = true;

        const cancelEditBtn = createButton('Cancel', 'cancel-button', '', editProjectTitleForm);
        cancelEditBtn.type = 'button';

        const editProjectTitleBtn = createButton('Save and close', 'submit-button', '', editProjectTitleForm);
        editProjectTitleModal.appendChild(editProjectTitleForm);


        const editProjectTitleBtnHandler = () => {
            editProjectTitleTitleInput.readOnly = false;

            if (!editProjectTitleForm.checkValidity()) return;
            
            project.editProjectTitle(editProjectTitleTitleInput.value);

            renderNav();
            renderProject(project);
        };

        const editProjectTitleInputsToReadWrite = (e) => {
            e.target.readOnly = false;
        };

        const editProjectTitleInputsToReadOnly = (e) => {
            e.target.readOnly = true;
        };

        editProjectTitleTitleInput.addEventListener('click', editProjectTitleInputsToReadWrite);
        editProjectTitleTitleInput.addEventListener('focusout', editProjectTitleInputsToReadOnly);

        editProjectTitleBtn.addEventListener('click', editProjectTitleBtnHandler);

        editProjectTitleForm.addEventListener('submit', (e) => {
            editProjectTitleTitleInput.removeAttribute('required');
            editProjectTitleForm.reset();
            setTimeout(() => {
                editProjectTitleTitleInput.setAttribute('required', '');
            }, 100);
        });

        openEditProjectTitleModal.addEventListener('click', () => {
            editProjectTitleTitleInput.value = project.title;
            editProjectTitleModal.showModal();
        });

        cancelEditBtn.addEventListener('click', () => editProjectTitleModal.close());
    }

    const renderNav = () => {
        projectsNavContainer.replaceChildren();
        const projects = projectsManager.projectsArr;
        if (projects.length > 0) {
            projects.forEach((project) => {
                createNavItem(project);
            });
        }
    };

    const toggleActiveProjectTabUI = (projectIndex) => {
        const buttonContainer = document.querySelector(`[data-project-index="${projectIndex}"]`);

        const activeProjectButton = buttonContainer.firstElementChild;
        activeProjectButton.classList.add('active-tab');

        // remove previously selected quick nav button, if it exists
        const previousActiveQuickNavTab = document.querySelector('.active-quickNav-tab');
        if (previousActiveQuickNavTab) previousActiveQuickNavTab.classList.remove('active-quickNav-tab');
    };

    thisWeekItemsBtn.addEventListener('click', () => {
        renderThisWeekItems();

        toggleNavIfBackdropIsVisible()
    });

    todayItemsBtn.addEventListener('click', () => {
        renderTodaysItems();

        toggleNavIfBackdropIsVisible()
    });
        
    allItemsBtn.addEventListener('click', () => {
        renderAllItems();

        toggleNavIfBackdropIsVisible()
    });

    createProjectBtn.addEventListener('click', () => {
        if (!inputProjectTitle.validity.valid) return;

        const project = createProject(inputProjectTitle.value);
        projectsManager.addProject(project);

        createNavItem(project);
        renderProject(project);

        toggleNavIfBackdropIsVisible();
    });

    cancelBtn.addEventListener('click', () => {
        projectModal.close();
    });

    createProjectForm.addEventListener('submit', (e) => {
        inputProjectTitle.removeAttribute('required');
        createProjectForm.reset();
        setTimeout(() => {
            inputProjectTitle.setAttribute('required', '');
        }, 100);
      });

    openProjectCreateModal.addEventListener('click', () => {
        projectModal.showModal();
    });

    // initial render moved in index.js
    // renderNav();

    return { navDOMElem: nav, renderNav, createEditProjectTitleButton, toggleActiveProjectTabUI };
};

export default createNavElement();
