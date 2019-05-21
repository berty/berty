# Contributing guidelines

# Issues

* Issues creation is not restricted, everyone can create an issue, especially if it’s an idea
* Title should be precise and descriptive, and follow the naming convention [INSERT LINK TO NAMING CONVENTION] 
* Description should follow the provided templates, especially for bugs (it’s important for tackling the issues effectively) [INSERT LINK TO TEMPLATE]
* An issue can be later edited/closed/linked to a meta (we believe it’s better to create an issue even if you are not sure of it’s accuracy or how to name it, and to edit it afterwards, than not create an issue at all because you can’t comply to contributing guidelines at the moment)
* When working on a task that drags on for many days, keep the corresponding issue (or PR) updated, even if it’s not a coding task (you can even post pictures of a whiteboard)

# Commits

* Title should follow the “conventional commit” convention : https://www.conventionalcommits.org/en/v1.0.0-beta.4/
* Make your commits as atomic as possible

# Pull Request Process & Review Policies

* When creating a pull request :
  * If there is an issue : put an explicit title + link to the issue + eventually add a description
  * Is there is no issue : put an explicit title + choose your wording wisely in the description
* The title of the pull request :
  * should be precise and descriptive as well, because it’s used to generate the changelog
  * should follow the naming convention : [INSERT LINK TO NAMING CONVENTION]
* First review
  * Every pull request should be reviewed, no exceptions (we never merge a pull request without a review)
* Second review
  * You can ask for a second review at any time
  * However, second review is mandatory in some cases :
    * Refactoring
    * Large PR (more than a week of work)
    * New package
    * … significant code change
* Review is asynchronous :
  * when requested, it should be done when the reviewer is available
  * no later than the noon of the next day after submission (don’t block someone for more than 24 hours)
  * if it’s urgent, you can ask for a review right away
  * a reviewer is allowed to not be available right away
* Review is rigorous about coding practices (coding style, descriptive func names, etc…) to avoid technical debt
* The reviewer :
  * is based on the codeowner file (each domain/folder has at least one maintainer)
  * can be based on github recommendation (when applicable)
* For large pull requests, the reviewer can ask (and can help) splitting the pull request
* Pull requests should be kept atomic - avoid submitting a pull request that handles too many different things

# Testing policy

* The more a package or function is atomic & defined (will not change), the more time we should invest in unit testing
* The more a package handles too many things or is always evolving, the more time should be invested in integration testing
* Should be unit tested :
  * atomic packages (everything in berty/pkg)
  * protocol
  * entities
* Integration tests :
  * should be maintained
  * easy to use (in the CI; for travels, for example)
* Fixing a bug ?
  * make sure to write a test so it won’t come back
  * at a minimum, write a post-mortem in the issue
* Create continuous testing:
  * not linked to a specific PR
  * complex scenarios
  * detects spontaneous issues
  * it’s like monitoring
  * eventually use it for PR (partially)

# Documentation

* If something that needs explaining is a go function, use godoc
* Maintain the README.md updated, with getting started & how-to
* Have a dedicated website for documentation

# Code of Conduct

[WILL BE WRITTEN LATER]

