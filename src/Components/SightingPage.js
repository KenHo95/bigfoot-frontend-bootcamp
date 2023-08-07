import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import ListGroup from "react-bootstrap/ListGroup";

import EditComment from "./EditComment";
import { BACKEND_URL } from "../constants";

const SightingPage = (props) => {
  const [selectedSighting, setSelectedSighting] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editCommentId, setEditCommentId] = useState(0);
  let { sightingId } = useParams(); // get selected sightingIndex from url params as this persist after user refreshes page
  const navigate = useNavigate();

  const getSingleSightingData = async () => {
    const data = await axios.get(`${BACKEND_URL}/${sightingId}`);

    setSelectedSighting(data.data);
  };

  const getComments = async () => {
    const data = await axios.get(`${BACKEND_URL}/${sightingId}/comments`);

    setComments(data.data.reverse()); // reverse order of comments to show latest first
    // console.log(typeof data.data[0].createdAt);
  };

  useEffect(() => {
    getSingleSightingData();
    getComments();
    return;
  }, []);

  const selectedSightingList = (
    // render list of sighting after selectedSighting is retrieved
    <li>
      Date:
      <br />
      {selectedSighting.date}
      <br />
      <br />
      Location Discription: <br />
      {selectedSighting.location_discription}
      <br />
      <br />
      Notes: <br />
      {selectedSighting.notes}
      <br />
      <br />
      City: <br />
      {selectedSighting.city}
      <br />
      <br />
      Country: <br />
      {selectedSighting.country}
    </li>
  );

  const dateStrTodateFormat = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      hour12: true,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  const commentList = comments.map((comment, id) => (
    <div key={id}>
      <ListGroup.Item action>
        {/* {console.log(comment.id)} */}
        {comment.id === editCommentId ? (
          <EditComment
            preloadComment={comment.content}
            setEditCommentId={setEditCommentId}
            sightingId={sightingId}
            commentID={editCommentId}
            getComments={getComments}
          />
        ) : (
          comment.content
        )}
        <br />
        Created: {dateStrTodateFormat(comment.createdAt)}
        <br />
        {comment.createdAt !== comment.updatedAt &&
          "Edited: " + dateStrTodateFormat(comment.updatedAt)}
      </ListGroup.Item>
      <Button variant="contained" onClick={() => setEditCommentId(comment.id)}>
        Edit
      </Button>
      <Button
        variant="contained"
        onClick={async () => {
          await axios.delete(`${BACKEND_URL}/comments`, {
            data: {
              commentId: comment.id,
            },
          });

          getComments();
        }}
      >
        Delete
      </Button>
    </div>
  ));

  const handleCommentFormSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${BACKEND_URL}/${sightingId}/comments`, {
      content: commentInput,
    });

    getComments();
    setCommentInput("");
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          navigate("/sightings");
        }}
      >
        {" "}
        Back
      </Button>{" "}
      <Button
        variant="contained"
        onClick={() => {
          navigate(`/sightings/${sightingId}/edit`);
        }}
      >
        {" "}
        Edit
      </Button>
      <ul className="sighting-list">{selectedSightingList}</ul>
      <br />
      <form onSubmit={handleCommentFormSubmit}>
        Enter comments:{" "}
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <input type="submit" />
        <br />
        <br />
      </form>
      <ListGroup>
        <ListGroup.Item active>Comments</ListGroup.Item>
        {commentList}
      </ListGroup>
    </div>
  );
};

export default SightingPage;
