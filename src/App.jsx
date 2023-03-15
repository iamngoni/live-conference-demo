import { useState, useEffect } from "react";
import "./App.css";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useDyteClient } from "@dytesdk/react-web-core";

function App() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [meetingAuthToken, setMeetingAuthToken] = useState(null);
  const [name, setName] = useState(null);
  const [meeting, initMeeting] = useDyteClient();

  const organizationId = "60fb0654-1322-46d5-8a7e-22de69c492c3";
  const apiKey = "aceb1b31e0d826fb03a9";

  useEffect(() => {
    if (!meeting) return;
    const meetingLeftCallback = (reason) => {
      console.log("Left meeting");
      console.log(`Reason: ${reason}`);
      setMeetingStarted(false);
      window.alert("Left meeting");
    };
    meeting.self.on("roomLeft", meetingLeftCallback);
    return () => {
      meeting.self.removeListener("roomLeft", meetingLeftCallback);
    };
  }, [meeting]);

  const joinMeeting = async () => {
    let id = meetingId;
    if (id == null || id == "") {
      window.alert("Please enter a meeting ID");
      return;
    }

    try {
      let userName = window.prompt("Please enter your name");
      if (userName == null || userName == "") {
        window.alert("Please enter a name");
        return;
      }

      setName(userName);

      const authHeaderValue = btoa(`${organizationId}:${apiKey}`);
      console.log("Adding participant to meeting");
      const participantsResponse = await axios.post(
        `https://api.cluster.dyte.in/v2/meetings/${id}/participants`,
        {
          name: userName,
          picture:
            "https://modestnerd.nyc3.cdn.digitaloceanspaces.com/modestnerd/media/checkout_options/visa-mastercard-logos.jpg",
          preset_name: "Hekima Preset",
          custom_participant_id: uuidv4(),
        },
        {
          headers: {
            Authorization: `Basic ${authHeaderValue}`,
          },
        }
      );

      if (participantsResponse.status == 201) {
        console.log("Participant added");
        let authToken = participantsResponse.data?.data?.token;
        setMeetingAuthToken(authToken);
        initMeeting({
          authToken: authToken,
          defaults: {
            audio: false,
            video: false,
          },
        });
        setMeetingStarted(true);
      } else {
        console.log("Panic - aaah!!!");
        window.alert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      console.log("Panic - aaah!!!");
      window.alert("Something went wrong. Please try again later.");
    }
  };

  const createMeeting = async () => {
    try {
      let userName = window.prompt("Please enter your name");
      if (userName == null || userName == "") {
        window.alert("Please enter a name");
        return;
      }

      setName(userName);

      const authHeaderValue = btoa(`${organizationId}:${apiKey}`);
      console.log(authHeaderValue);
      const response = await axios.post(
        "https://api.cluster.dyte.in/v2/meetings",
        {
          title: "Demo Meeting",
          preferred_region: "us-east-1",
          record_on_start: false,
          live_stream_on_start: false,
        },
        {
          headers: {
            Authorization: `Basic ${authHeaderValue}`,
          },
        }
      );

      if (response.status == 201) {
        console.log("Meeting created");
        console.log(response.data);
        let id = response.data?.data?.id;
        setMeetingId(id);
        console.log("Adding participant to meeting");
        const participantsResponse = await axios.post(
          `https://api.cluster.dyte.in/v2/meetings/${id}/participants`,
          {
            name: userName,
            picture:
              "https://modestnerd.nyc3.cdn.digitaloceanspaces.com/modestnerd/media/checkout_options/visa-mastercard-logos.jpg",
            preset_name: "Hekima Preset",
            custom_participant_id: uuidv4(),
          },
          {
            headers: {
              Authorization: `Basic ${authHeaderValue}`,
            },
          }
        );

        if (participantsResponse.status == 201) {
          console.log("Participant added");
          let authToken = participantsResponse.data?.data?.token;
          setMeetingAuthToken(authToken);
          initMeeting({
            authToken: authToken,
            defaults: {
              audio: false,
              video: false,
            },
          });
          setMeetingStarted(true);
        } else {
          console.log("Panic - aaah!!!");
          window.alert("Something went wrong. Please try again later.");
        }
      } else {
        console.log(response);
        console.log("Panic - aaah!!!");
        window.alert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      console.log("Panic - aaah!!!");
      window.alert("Something went wrong. Please try again later.");
    }
  };

  return !meetingStarted ? (
    <div className="h-screen flex justify-center items-center columns-1">
      <div>
        <input
          type="text"
          id="meeting-code"
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Meeting ID"
          onChange={(e) => setMeetingId(e.target.value)}
        />
      </div>
      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
          onClick={createMeeting}
        >
          New Meeting
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          onClick={joinMeeting}
        >
          Join Meeting
        </button>
      </div>
    </div>
  ) : (
    <div className="h-screen columns-2">
      <div className="h-3/4 overflow-x-hidden">
        <DyteMeeting meeting={meeting} mode="fill" className="" />
      </div>

      <div className="overflow-y-scroll">
        <div className="flex flex-col">
          <h1 className="flex-auto text-lg font-semibold text-slate-900">
            Meeting ID <small>(share this with other participants)</small>
          </h1>
          <hr />
          <div className="text-lg font-semibold text-slate-500">
            {meetingId}
          </div>
        </div>
        <div className="py-5">
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
          <p className="py-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            commodi molestiae aliquam incidunt assumenda nemo odio. Laborum
            cupiditate dolor cumque eius! Numquam quam quaerat accusantium quae
            adipisci, nobis laborum deserunt?
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
