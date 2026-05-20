import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/user.js";
import imagekit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

//Text-based AI chat message controller 

export const textMessageController = async (req, res) => {

    try {
        const userId = req.user._id;


        //check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" });
        }

        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ _id: chatId, userId });
        console.log("CHAT:", chat);

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false

        });

        const { choices } = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };



        res.json({ success: true, message: "Message sent successfully", reply });

        chat.messages.push(reply);

        await chat.save();

        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });



    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//image generation message controller

export const imageMessageController = async (req, res) => {
    console.log("API HIT ✅");
    try {
        const userId = req.user._id;

        //check credits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" });
        }

        const { prompt, chatId, isPublished } = req.body;

        //Find chat
        const chat = await Chat.findOne({ _id: chatId, userId });

        console.log("CHAT:", chat);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        //push  user message to chat
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,

        });

        //Encoded the prompt

        const encodedPrompt = encodeURIComponent(prompt);

        //constrect imagekit ai generation url
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        //tiger genration from fetching the image from imagekit ai generation url
        const imageBuffer = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });

        //convert base64
        const base64 = Buffer.from(imageBuffer.data).toString("base64");

        //uplod to imagekit Media Library
        const uploadResponse = await imagekit.upload({
            file: `data:image/png;base64,${base64}`,
            fileName: `${Date.now()}.png`,
            folder: "Nexusgpt",
        });

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished: isPublished === true
        };


        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });


        res.json({ success: true, message: "Message sent successfully", reply });



    }
    catch (error) {
        console.error("IMAGE ERROR FULL:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



