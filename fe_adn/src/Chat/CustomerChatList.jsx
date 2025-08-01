import React, { useEffect, useState } from "react";
import axiosClient from "../config/AxiosClient";

export default function CustomerChatList({ onSelectCustomer }) {
    const [rooms, setRooms] = useState([]);
    const [showList, setShowList] = useState(false); // mặc định ẩn

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axiosClient.get("/api/v1/rooms/customers");
                setRooms(res.data.result);
            } catch (err) {
                console.error("Failed to load customer rooms:", err);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="card mb-4">
            <div
                className="card-header bg-white fw-bold d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => setShowList((prev) => !prev)}
            >
                <span>💬 Chọn khách để chat</span>
                <i className={`bi ${showList ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
            </div>

            {showList && (
                <ul className="list-group list-group-flush">
                    {rooms.map((room) => (
                        <li
                            key={room.roomId}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() =>
                                onSelectCustomer({
                                    customerId: room.customerId,
                                    customerName: room.customerName,
                                    roomId: room.roomId,
                                })
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <span>{room.customerName}</span>
                            <i className="bi bi-chat-dots text-primary"></i>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
