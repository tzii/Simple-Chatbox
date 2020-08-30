$(document).ready(() => {
    M.AutoInit();
});
const setupUI = (user) => {
    if (user) {
        $(`[data-target="mobile-demo"]`).fadeOut();
        $(".signup-btn").fadeOut();
        $(".login-btn").fadeOut();
        $(".account-btn").fadeIn();
        $(".send").fadeIn();
        $(`[data-target="profile"]`).fadeIn();
    } else {
        $(`[data-target="profile"]`).fadeOut();
        $(".account-btn").fadeOut();
        $(".send").fadeOut();
        $(".signup-btn").fadeIn();
        $(".login-btn").fadeIn();
        $(`[data-target="mobile-demo"]`).fadeIn();
        M.Modal.getInstance(signupModal).open();
    }
};
const reloadProfile = (user) => {
    if (user) {
        $("#name-profile").text(user.displayName);
        $("#email-profile").text(user.email);
        $("#avatar-profile").attr({ src: user.photoURL });
    } else {
        $("#name-profile").text(null);
        $("#email-profile").text(null);
        $("#avatar-profile").attr({ src: "" });
    }
};
const loadChatbox = (user) => {
    if (user) {
        $(".chatbox .container").html("");
        db.collection("Chatbox")
            .orderBy("Time", "asc")
            .limitToLast(10)
            .get()
            .then((snapShot) => {
                snapShot.docs.forEach((m) => {
                    if (m.data().UID == auth.currentUser.uid) {
                        $(".chatbox .container").append(`<div class="row">
                                        <div class="col s9 right">
                                            <span class="blue mess-content right">${
                                                m.data().Content
                                            }</span>
                                        </div>
                                    </div>`);
                    } else {
                        otherMess(m.data());
                    }
                });
            })
            .then(() => {
                $("html").animate({ scrollTop: 10000 }, 600);
            });
    } else {
        $(".chatbox .container").html(
            `<h1 class="center-align">Login to join chatbox</h1>`
        );
    }
};
const getNewMessage = () => {
    if (!mark) {
        mark = true;
        return;
    }
    db.collection("Chatbox")
        .orderBy("Time", "desc")
        .limit(1)
        .get()
        .then((snapShot) => {
            snapShot.docs.forEach((m) => {
                if (m.data().UID == auth.currentUser.uid) {
                    $(".chatbox .container").append(`<div class="row">
                                        <div class="col s9 right">
                                            <span class="blue mess-content right">${
                                                m.data().Content
                                            }</span>
                                        </div>
                                    </div>`);
                } else {
                    otherMess(m.data());
                }
            });
        })
        .then((uid) => {
            $("html").animate({ scrollTop: 10000 }, 600);
        })
        .catch((err) => {
            console.log(err);
        });
};
const changeAvatar = (file) => {
    storage
        .ref(auth.currentUser.uid)
        .put(file)
        .then((snap) => snap.ref.getDownloadURL())
        .then((url) => auth.currentUser.updateProfile({ photoURL: url }))
        .then(() => reloadProfile(auth.currentUser))
        .catch((err) => console.log(err));
};
const getAvatarDefaultURL = () => {
    storage
        .ref("default.png")
        .getDownloadURL()
        .then((url) => {
            dfAvatar = url;
        });
};
const otherMess = (mess) => {
    send(mess);
    if (avatarURLs[mess.UID]) {
        $(`[data-id="${mess.UID}"] img`).attr("src", avatarURLs[mess.UID]);
    } else {
        storage
            .ref(mess.UID)
            .getDownloadURL()
            .then((url) => {
                avatarURLs[mess.UID] = url;
                $(`[data-id="${mess.UID}"] img`).attr(
                    "src",
                    avatarURLs[mess.UID]
                );
            })
            .catch((err) => {
                if (err.code == "storage/object-not-found") {
                    console.log("not found in storage");
                } else console.log("smt wrong in getAvatarURL func");
                avatarURLs[mess.UID] = dfAvatar;
                $(`[data-id="${mess.UID}"] img`).attr(
                    "src",
                    avatarURLs[mess.UID]
                );
            });
    }
};
const send = (mess) => {
    $(".chatbox .container").append(`<div class="row">
                                        <div class="col m1 s2 pull-s1">
                                            <a href="#" data-id="${mess.UID}" class="avatar-mess">
                                                <img class="responsive-img-cus circle z-depth-1" src="" alt="" />
                                            </a>
                                        </div>
                                        <div class="col m9 s8 pull-s1">
                                            <span class="blue mess-content">${mess.Content}</span>
                                        </div>
                                    </div>`);
    $(`[data-id="${mess.UID}"]`).click((e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        db.collection("Users")
            .doc(mess.UID)
            .get()
            .then((snap) =>
                M.toast({ html: snap.data().displayName, classes: "rounded" })
            );
    });
};
