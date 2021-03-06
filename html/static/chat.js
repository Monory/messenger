function SendMessage(socket) {
    var data = $(".message-text").val();

    setTimeout(function () {
        $(".message-text").val("")
    }, 0);

    if (data.length == 0) {
        return;
    }

    if ($(".contact-selected").text() == "") {
        return;
    }

    var message = {"text": {"message": window.btoa(sjcl.encrypt(password, data)), "receiver": $(".contact-selected").text()}};
    console.log("SENDING", JSON.stringify(message))
    socket.send(JSON.stringify(message));
}

function ReceiveMessage(event) {
    var message = $.parseJSON(event.data);
    console.log(event.data)

    if (message.text != null) {
        HandleMessage(message.text);
    } else if (message.command != null) {
        HandleCommand(message);
    }
}

function HandleMessage(message) {
    var messageString = $("<li class=\"message\"></li>");
    messageString.append($("<strong></strong>").text(message.author + ": "));
    messageString.append($("<span></span>").text(sjcl.decrypt(password, window.atob(message.message))));
    $("#chat-messages").append(messageString);

    $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
}

function HandleCommand(message) {
    switch (message.command.name) {
        case "send-contacts":
            $(".contacts").empty()
            for (var chat in message.command.args) {
                var chatString = $("<div class=\"contact\"></div>");
                chatString.append($("<div class=\"contact-element contact-name\"></div>").text(message.command.args[chat]));
                $(".contacts").append(chatString);

                chatString.click(chatString, SelectChat);
            }
            break;
        case "send-messages":
            for (var v in message.command.args) {
                HandleMessage(message.command.args[v]);
            }
            break;
        case "error":
            alert(message.command.args)
            break;
        default:
            console.log(message);
            break;
    }
}

function SelectChat(event) {
    password = prompt("Please choose the password for this chat:");
    if (password == null) {
        return;
    }

    socket.send(JSON.stringify({"command": {"name": "chat-select", "args": event.data.find(".contact-element").text()}}));

    // change style
    selectedChat = event.data;
    selectedChat.siblings().removeClass("contact-selected");
    selectedChat.addClass('contact-selected');

    $(".header-message").text(event.data.find(".contact-element").text());

    $("#chat-messages").empty();

    $(".message-text").prop("disabled", false);
    $(".message-button").prop("disabled", false);
    // console.log(event.data.find(".contact-element").text(), "!!!!!")
}

function CloseConnection() {
    $(".message-text").prop("disabled", true);
    $(".message-text").val("Connection closed. Refresh to chat again!");

    $(".message-button").prop("disabled", true);
}

function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : 0;
}

function OpenConnection(socket) {
    socket.send(getCookie("chat_token"));

    // $(".message-text").prop("disabled", false);
    // $(".message-button").prop("disabled", false);
}

function NewChat() {
    var name = prompt("Enter chat name:");

    if (name != null && name != "") {
        socket.send(JSON.stringify({"command": {"name": "new-chat", "args": name}}))
    }
}

$(function() {
    socket = new WebSocket("wss://chat.monory.org/ws");

    socket.onopen = function() {
        OpenConnection(socket);
    };
    socket.onmessage = ReceiveMessage;
    socket.onclose = CloseConnection;

    $('.message-button').click(function() {
        SendMessage(socket);
    });

    $('.message-text').keydown(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            SendMessage(socket);
        }
    });
});
