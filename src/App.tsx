import React, { useState, useEffect, Fragment, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  NavigateFunction,
  useParams,
  useLocation,
  Location as ReactLocation,
  Params,
} from "react-router-dom";

import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import { Stack } from "@mui/material";
import { VolumeMute } from "@mui/icons-material";

interface Dirs {
  year: number;
  months: {
    [key in months]: string[];
  };
}

enum Months {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}

const m = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
type months =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

const TinyText = styled(Typography)({
  fontSize: "0.75rem",
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

function valuetext(value: number) {
  return `${value}°C`;
}

function RangeSlider(props: {
  audioRef: HTMLAudioElement;
  intervalRef: React.MutableRefObject<number | undefined>;
}) {
  const [playing, setPlaying] = useState(false);
  const [startEnd, setStartEnd] = React.useState<number[]>([
    0,
    props.audioRef.duration,
  ]);
  // 0 current volume, 1 prev volume
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  // Slider elements
  const refStart = useRef<HTMLSpanElement>(null);
  const refEnd = useRef<HTMLSpanElement>(null);

  //   const currentPercentage = duration
  //     ? `${(trackProgress / duration) * 100}%`
  //     : "0%";
  const startTimer = () => {
    // Clear any timers already running
    console.log(props.intervalRef);
    clearInterval(props.intervalRef.current);

    const rand = Math.random();
    props.intervalRef.current = setInterval(() => {
      //   if (audioRef.current.ended) {
      //     // toNextTrack();
      //   } else {
      //     // setTrackProgress(audioRef.current.currentTime);
      //   }
    }, 1000);
  };

  //   const currentPercentage = audioCtx.currentTime
  //     ? `${(audioCtx.currentTime / source!.buffer!.duration!) * 100}%`
  //     : "0%";

  //   setInterval(() => {
  //     console.log(currentPercentage);
  //   }, 10);

  useEffect(() => {
    startTimer();
  }, [props.audioRef]);
  function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const handleChangeVolume = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    props.audioRef.volume = newValue as number;
  };

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    console.log("double slider", newValue);
    const minDistance = 10;
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      props.audioRef.currentTime = newValue[0];
      setStartEnd([
        Math.min(newValue[0], startEnd[1] - minDistance),
        startEnd[1],
      ]);
    } else {
      setStartEnd([
        startEnd[0],
        Math.max(newValue[1], startEnd[0] + minDistance),
      ]);
    }
  };

  return (
    <Box sx={{ width: 2 / 4 }} className="m-16">
      <Button
        onClick={(e) => {
          if (!playing) {
            props.audioRef.play();
            setPlaying((prev) => !prev);
            e.currentTarget.innerHTML = "Pause";
          } else {
            setPlaying((prev) => !prev);
            // source?.stop();
            props.audioRef.pause();
            e.currentTarget.innerHTML = "Play";
          }
        }}
      >
        Play
      </Button>
      <Slider
        sx={{
          "& .MuiSlider-thumb": {
            // height: 28,
            // width: 28,
          },
        }}
        max={props.audioRef.duration}
        getAriaLabel={() => "Minimum distance"}
        value={startEnd}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        disableSwap
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: -2,
        }}
      >
        <TinyText ref={refStart}>{formatDuration(startEnd[0])} </TinyText>
        <TinyText ref={refEnd}>
          {formatDuration(Math.round(props.audioRef.duration))}
        </TinyText>
      </Box>
      <Stack
        spacing={2}
        direction="row"
        sx={{ mb: 1, width: 200 }}
        alignItems="center"
      >
        {muted ? (
          <VolumeMute
            onClick={() => {
              props.audioRef.muted = false;
              setMuted(false);
            }}
          />
        ) : (
          <VolumeDown
            onClick={() => {
              props.audioRef.muted = true;
              setMuted(true);
            }}
          />
        )}

        <Slider
          sx={{
            "& .MuiSlider-thumb": {
              // height: 28,
              // width: 28,
            },
          }}
          max={1}
          step={0.01}
          getAriaLabel={() => "Minimum distance"}
          value={volume}
          onChange={handleChangeVolume}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
        />
        <VolumeUp />
      </Stack>
      value 1: {startEnd[0]} TODO: convert to time
      <br />
      value 2: {startEnd[1]} TODO: convert to time
      <br></br>
      button button
    </Box>
  );
}
1;

function YearSelection() {
  let params = useParams();
  return (
    // render the audio playback functionality if we have the full url
    <>
      <AllYears /> {params.year && <AudioInterface />}
    </>
  );
}

function AudioInterface() {
  console.log("render Audio Interface");
  const intervalRef = useRef<number | undefined>();
  let params = useParams<"guild_id" | "file_name" | "month" | "year">();
  console.log("audio", params);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let audioRef = new Audio(
      `http://dev.patrykstyla.com/audio/${params.guild_id}/${params.year}/${params.month}/${params.file_name}.ogg`
    );
    console.log("audio Ref", audioRef!.readyState);
    audioRef!.addEventListener("canplaythrough", (e) => {
      setReadyToPlay(true);
      setAudioRef(audioRef);
    });
    audioRef.onerror = () => {
      setError(true);
    };
    console.log("mount Audio Interface");

    return function cleanup() {
      audioRef?.pause();
      //   setAudioRef(null);
      setReadyToPlay(false);
      setError(false);
    };
  }, [params.file_name]);
  // return function cleanup() {
  //   setData(null)
  // }

  if (error) {
    return <div>An error occured</div>;
  }

  return (
    <>
      <div className="flex-initial w-4/5 mt-10">
        {readyToPlay ? (
          <RangeSlider audioRef={audioRef!} intervalRef={intervalRef} />
        ) : (
          "Downloading"
        )}
      </div>
    </>
  );
}

{
  /* // <div id="audio-player-container">
    //   <p>Audio Player</p>

    //   <button
    //     id="play-icon"
    //     onClick={(e) => {
    //       if (!playing) {
    //         e.currentTarget.children[0].innerHTML = "play_arrow";
    //       } else {
    //         e.currentTarget.children[0].innerHTML = "pause";
    //       }
    //       setPlaying((prev) => !prev);
    //     }}
    //   >
    //     {" "}
    //     <span className="material-icons">pause</span>
    //   </button>
    //   <span id="current-time" className="time">
    //     0:00
    //   </span>
    //   {/* Current audio time slider */
}

//   {/* Volume slider */}
//   <output id="volume-output">100</output>
//   <input type="range" id="volume-slider" max="100" defaultValue="100" />
//   <button id="mute-icon"></button>
// </div> */}

function Dashboard() {
  // Temporary hack
  // TODO:server selection
  let navigate = useNavigate();
  useEffect(() => {
    navigate("/audio/362257054829641758");
  });
  return <div>Dashvoard</div>;
}

interface AppProps {}

function App({}: AppProps) {
  // Return the App component.
  return (
    <div className="flex">
      <BrowserRouter>
        {/* <Button variant="contained">Hello World</Button> */}
        <Routes>
          <Route path="/audio">
            <Route
              path=":guild_id/:year/:month/:file_name"
              element={<YearSelection />}
            ></Route>
            <Route path=":guild_id" element={<YearSelection />}></Route>
          </Route>
          <Route path="/" element={<Dashboard />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function handleClickOnFile(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  navigate: NavigateFunction,
  location: ReactLocation,
  year: number,
  month_name: string,
  params: Readonly<Params<string>>
) {
  e.preventDefault();
  if (
    location.pathname ===
    `/audio/${
      params.guild_id
    }/${year}/${month_name}${e.currentTarget.innerHTML.slice(0, -4)}`
  ) {
    // same locaiton dont do anything
  } else {
    navigate(
      `/audio/${
        params.guild_id
      }/${year}/${month_name}/${e.currentTarget.innerHTML.slice(0, -4)}`
    );
  }
}

function ItemsEl(props: { file: string; year: number; month_name: string }) {
  let navigate = useNavigate();
  let location = useLocation();
  let params = useParams();
  return (
    <div
      className="bg-orange-600"
      onClick={(e) =>
        handleClickOnFile(
          e,
          navigate,
          location,
          props.year,
          props.month_name,
          params
        )
      }
    >
      {props.file}
    </div>
  );
}

function MonthsEl(props: {
  files: string[];
  month_name: string;
  year: number;
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  clicked_multiple: boolean;
}) {
  const contentEl = useRef<HTMLDivElement>(null);

  const months = props.files.map((el, index) => {
    return (
      <ItemsEl
        year={props.year}
        month_name={props.month_name}
        key={index}
        file={el}
      ></ItemsEl>
    );
  });

  return (
    <Fragment>
      <div onClick={() => props.onToggle(props.index)} className="bg-blue-700">
        {props.month_name}
      </div>
      <div
        key={props.index}
        className="bg-green-500 overflow-hidden"
        ref={contentEl}
        style={props.active ? { display: "block" } : { display: "none" }}
      >
        {months}
      </div>
    </Fragment>
  );
}

// a year will return up to 12 months
function YearsEl(props: {
  el: Dirs;
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  clicked_multiple: boolean;
  setClickedMultiple: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [clicked, setClicked] = useState(-1);

  const [keepOpen, setKeepOpem] = useState(false);
  const handleToggleKeep = () => {
    setKeepOpem((prev) => !prev);
  };

  const contentEl = useRef<HTMLDivElement>(null);
  // state to keep one accordion open
  const handleToggle = (index: number) => {
    // We start indexing from 0 so no selection is anyhting lower or higher that our current index
    if (clicked === index) {
      return setClicked(-1);
    }
    setClicked(index);
  };

  let months_obj = Object.keys(props.el.months);
  let result = months_obj.map((month_name, index) => {
    let month = month_name as months;
    let files = props.el.months[month];
    return (
      <MonthsEl
        index={index}
        month_name={month_name}
        year={props.el.year}
        active={clicked === index}
        onToggle={() => handleToggle(index)}
        key={index}
        clicked_multiple={false}
        files={files}
      />
    );
  });

  return (
    <>
      <div
        className={
          "accordion " +
          (props.active ? "bg-green-800" : "bg-green-500") +
          " hover:bg-green-700 active:bg-red-800"
        }
        onClick={() => {
          props.clicked_multiple
            ? handleToggleKeep()
            : props.onToggle(props.index);
        }}
      >
        {props.el.year}
      </div>
      <div
        key={props.index}
        className="bg-green-500 overflow-hidden"
        ref={contentEl}
        style={
          props.clicked_multiple
            ? keepOpen
              ? { display: "block" }
              : { display: "none" }
            : props.active
            ? { display: "block" }
            : { display: "none" }
        }
      >
        {result}
      </div>
    </>
  );
}

function AllYears() {
  // get directory data
  const [data, setData] = useState<Dirs[] | null>(null);
  const params = useParams();
  useEffect(() => {
    fetch(`http://dev.patrykstyla.com/current/${params.guild_id}`, {
      method: "GET",
    }).then((response) => {
      if (!response.ok) {
        console.log("cannot get guild_iddirectory data");
      } else {
        console.log("got directory data");
        response.json().then((result: Dirs[]) => {
          setData(result);
        });
      }
    });
  }, []);
  const [clicked, setClicked] = useState(-1);
  // Determine wether to keep one accordion open or multiple
  const [clicked_multiple, setClickedMultiple] = useState(false);

  // Determine wether to keep one accordion open or multiple
  const handleChange = () => {
    setClickedMultiple(!clicked_multiple);
  };
  // state to keep one accordion open
  const handleToggle = (index: number) => {
    // We start indexing from 0 so no selection is anyhting lower or higher that our current index
    if (clicked === index) {
      return setClicked(-1);
    }
    setClicked(index);
  };

  if (data) {
    const years = data.map((el, index) => {
      return (
        <YearsEl
          key={index}
          el={el}
          index={index}
          onToggle={() => handleToggle(index)}
          active={clicked === index}
          clicked_multiple={clicked_multiple}
          setClickedMultiple={setClickedMultiple}
        />
      );
    });

    return (
      <div className="flex-initial w-1/5">
        <label>
          Expand multiple
          <input
            type="checkbox"
            checked={clicked_multiple}
            onChange={handleChange}
          ></input>
        </label>
        {years}
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
export default App;
