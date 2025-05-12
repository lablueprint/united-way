import uwLogo from './images/uwlogo.svg';
import overview from './images/home-overview.svg';
import features from './images/home-features.svg';
import quick from './images/home-quick.svg';
import list from './images/events-list.svg';
import types from './images/events-types.svg';
import differs from './images/events-differs.svg';
import content from './images/create-content.svg';
import custom from './images/create-custom.svg';
import filling from './images/create-filling.svg';
import engage from './images/rewards-engage.svg';
import manage from './images/rewards-manage.svg';
import points from './images/rewards-points.svg';
import badges from './images/profile-badges.svg';
import fill from './images/profile-fill.svg';
import review from './images/profile-review.svg';

const Pages = {
    "Home": {
        "featureOne": {
            "image": overview,
            "title": "Overview",
            "description": ["We aim to give admins an overview of all active events on the platform through this page. Here, admins can browse, search, and filter events by categories, tags, or organizers."],
        },
        "featureTwo": {
            "image": features,
            "title": "Features",
            "description": ["Featured and trending events are highlighted to drive visibility. You can also easily access other pages and functionalities like creating an event, rewards, and profile."],
        },
        "featureThree": {
            "image": quick,
            "title": "Quick Actions",
            "description": ["Quick actions allow admins to edit, duplicate, or share events directly from the homepage."]
        }
    },
    "Events": {
        "featureOne": {
            "image": differs,
            "title": "How it differs from ‘Home’",
            "description": ["The 'Events' page organizes events into Current, Upcoming, and Drafts sections for easy tracking. Admins can view event statuses at a glance, edit drafts, and manage upcoming event details."],
        },
        "featureTwo": {
            "image": types,
            "title": "Types of events",
            "description": ["Events are categorized into live events that are currently happening, upcoming events that are already published but have yet to take place, and draft events which are incomplete and unpublished."],
        },
        "featureThree": {
            "image": list,
            "title": "To-do list",
            "description": ["A built-in to-do list highlights pending tasks like completing setups, event information, and rewards which helps admins stay on track before launch. Here, you can see tasks organized based on their corresponding event draft."],
        }
    },
    "CreateEvent": {
        "featureOne": {
            "image": content,
            "title": "Uploading Content",
            "description": ["Upload event posters, set up QR codes for check-ins, and preview your event before publishing.", "Save drafts, questionnaires, raffles, announcements, activities, and manage access easily — all designed to make event creation fast, flexible, and hassle-free."],
        },
        "featureTwo": {
            "image": filling,
            "title": "Filling in information",
            "description": ["Quickly set up and launch events by adding essential details like title, description, date, time, and location.", "Start by typing into the input fields on our event creation page and continue from there."],
        },
        "featureThree": {
            "image": custom,
            "title": "To-do list",
            "description": ["Customize visibility settings to fit your event type and what it has to offer. Select tags for specific features of your event and keywords for higher discoverability.", "Add rewards to promote and encourage attendance!"],
        }
    },
    "Rewards": {
        "featureOne": {
            "image": points,
            "title": "How attendees earn points",
            "description": ["Attendees earn points by joining in on event activities, by participating in live polls, answer Q&As, complete games, and explore interactive challenges throughout the event."],
        },
        "featureTwo": {
            "image": manage,
            "title": "Manage your rewards",
            "description": ["Create and manage a catalog of rewards that attendees can redeem with their points. Add reward descriptions, point costs, quantity limits, and availability windows. You can offer anything from branded swag to exclusive access or digital gift cards — make it exciting to drive participation."],
        },
        "featureThree": {
            "image": engage,
            "title": "To-do list",
            "description": ["Maximize participation by integrating points into key event moments. Promote rewards during sessions, send push notifications, and highlight leaderboards if available. The more visible and accessible the rewards system is, the more likely attendees will interact and return."],
        }
    },
    "Profile": {
        "featureOne": {
            "image": review,
            "title": "Review your information",
            "description": ["This page lets you see your personal information, event history, and platform preferences. Ensure that everything is up-to-date and only accurate content is surfaced to event attendees."],
        },
        "featureTwo": {
            "image": fill,
            "title": "Filling in information",
            "description": ["Update your name, bio, profile photo, and account settings — all in one place. Change your notification, language, and other preferences alongside your organization’s information."],
        },
        "featureThree": {
            "image": badges,
            "title": "Collect badges",
            "description": ["Earn badges based on the types of events you host, how many completed ones there are, and how many communities you engage!"],
        }
    }
}

export { Pages, uwLogo };