const profileSidenav = document.getElementById("profile");
const sidenav = document.getElementById("mobile-demo");
const signupModal = document.getElementById("signup-modal");
const signinModal = document.getElementById("signin-modal");
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
const messForm = document.getElementById("input-mess");
var dfAvatar = "";
var mark = false;
var proxyUrl = "https://cors-anywhere.herokuapp.com/";
var avatarURLs = {};
var unsubSnapShot;
fetch("./firebaseConfig.json")
    .then((result) => result.json())
    .then((config) => {
        firebase.initializeApp(config);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        getAvatarDefaultURL();
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("Login successfull!");
                unsubSnapShot = db.collection("Chatbox").onSnapshot(
                    () => getNewMessage(),
                    (err) => {
                        console.log(err);
                    }
                );
                setupUI(user);
                loadChatbox(user);
            } else {
                console.log("No user");
                loadChatbox(user);
                setupUI(user);
            }
        });
    });

$("#signup-form").submit((e) => {
    e.preventDefault();
    let su_name = signupForm["su-name"].value;
    let su_email = signupForm["su-email"].value;
    let su_password = signupForm["su-password"].value;
    auth.createUserWithEmailAndPassword(su_email, su_password)
        .then((cred) => {
            cred.user.updateProfile({
                displayName: su_name,
                photoURL: dfAvatar,
            });
            db.collection("Users")
                .doc(cred.user.uid)
                .set({ displayName: su_name })
                .catch((err) => {
                    console.log(err);
                });
            fetch(dfAvatar)
                .then((res) => res.blob())
                .then((file) => changeAvatar(file))
                .catch((err) => console.log(err));
            M.Modal.getInstance(signupModal).close();
            signupForm.reset();
        })
        .catch((err) => $(".error").text(err.message));
});
$("#signin-form").submit((e) => {
    e.preventDefault();
    let email = signinForm["email"].value;
    let password = signinForm["password"].value;
    auth.signInWithEmailAndPassword(email, password)
        .then((cred) => {
            M.Modal.getInstance(signinModal).close();
        })
        .catch((err) => $(".error").text(err.message));
});

$(".account-btn").click((e) => {
    e.preventDefault();
    reloadProfile(auth.currentUser);
    M.Sidenav.getInstance(profileSidenav).open();
});
$(`[data-target="profile"]`).click((e) => {
    e.preventDefault();
    reloadProfile(auth.currentUser);
});
$("#logout-btn").click((e) => {
    e.preventDefault();
    unsubSnapShot();
    auth.signOut()
        .then((user) => {
            reloadProfile(user);
            M.Sidenav.getInstance(profileSidenav).close();
            console.log("user signed out");
        })
        .catch((er) => {
            console.log(er);
        });
});
$("#input-mess").submit((e) => {
    e.preventDefault();
    let content = messForm["mess-content"].value;
    if (content)
        db.collection("Chatbox")
            .add({
                UID: auth.currentUser.uid,
                Content: content,
                Time: Date.now(),
            })
            .then(() => {
                messForm.reset();
            })
            .catch((err) => console.log(err));
});
$("input:file").change((e) => {
    changeAvatar(e.target.files[0]);
});
$("#mobile-demo li")
    .first()
    .click((e) => {
        e.preventDefault();
        M.Sidenav.getInstance(sidenav).close();
        M.Modal.getInstance(signinModal).open();
    });
$("#mobile-demo li")
    .last()
    .click((e) => {
        e.preventDefault();
        M.Sidenav.getInstance(sidenav).close();
        M.Modal.getInstance(signupModal).open();
    });
$();
