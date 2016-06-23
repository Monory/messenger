function SendMessage(socket) {
    var data = $(".message-text").val();

    setTimeout(function () {
        $(".message-text").val("")
    }, 0);

    if (data.length == 0) {
        return;
    }

    var message = {"message": data};
    // console.log(JSON.stringify(message))
    socket.send(JSON.stringify(message));
}

function ReceiveMessage(event) {
    var message = $.parseJSON(event.data);

    if (message.message != null) {
        HandleMessage(message);
    } else if (message.chats != null) {
        HandleChatList(message);
    }
}

function HandleMessage(message) {
    var messageString = $("<li class=\"message\"></li>");
    messageString.append($("<strong></strong>").text(message.author + ": "));
    messageString.append($("<span></span>").text(message.message));
    $("#chat-messages").append(messageString);

    $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
}

function HandleChatList(message) {
    for (var chat in message.chats) {
        console.log(message.chats[chat], "!")

        var chatString = $("<div class=\"contact\"></div>");
        chatString.append($("<div class=\"contact-element contact-name\"></div>").text(message.chats[chat]));
        // chatString.append($("<div class=\"contact-element contact-message\"></div>").text("Sample text?"));
        $(".contacts").append(chatString);

        chatString.click(chatString, SelectChat);
    }
}

function SelectChat(event) {

    socket.send(JSON.stringify({"command": {"command": "chat-select", "argument": event.data.find(".contact-element").text()}}))

    // change style
    selectedChat = event.data;
    selectedChat.siblings().removeClass("contact-selected")
    selectedChat.addClass('contact-selected')

    $("#chat-messages").empty()
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

    $(".message-text").prop("disabled", false);
    $(".message-button").prop("disabled", false);
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
