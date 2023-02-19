import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  createContext,
  useContext,
} from "react";
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
  Outlet,
} from "react-router-dom";

import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import Modal from "@mui/material/Modal";
import {
  createTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import {
  Cloud,
  ContentCopy,
  ContentCut,
  ContentPaste,
  PropaneSharp,
  VolumeMute,
} from "@mui/icons-material";
import ResponsiveAppBar from "./navbar";
import Clips from "./clips";

interface Dirs {
  year: number;
  months: {
    [key in months]: IndividualFileArray;
  };
}

type IndividualFileArray = IndividualFile[];
type IndividualFile = { file: string; comment: string | null };

enum Months {
  "January" = 0,
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

export const PATH_PREFIX_FOR_LOGGED_USERS = "/dashboard";

function BasicTextFields(props: {
  startEnd: number[];
  setStartEnd: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return (
    <Box component="form" noValidate autoComplete="off">
      <TextField
        id="standard-basic"
        label="Go to"
        variant="standard"
        value={props.startEnd[0]}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        onChange={(e) =>
          props.setStartEnd((prev) => [
            e.target.value as any as number,
            prev[1],
          ])
        }
      />
    </Box>
  );
}

function valuetext(value: number) {
  return `${value}°C`;
}

function RangeSlider(props: {
  audioRef: HTMLAudioElement;
  intervalRef: React.MutableRefObject<number | undefined>;
  isClip: boolean;
  userGuilds: UserGuilds[] | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [startEnd, setStartEnd] = React.useState<number[]>([
    0,
    props.audioRef.duration,
  ]);

  //   const currentPercentage = duration
  //     ? `${(trackProgress / duration) * 100}%`
  //     : "0%";
  const startTimer = () => {
    // Clear any timers already running

    clearInterval(props.intervalRef.current);

    props.intervalRef.current = setInterval(() => {
      //   console.log(props.intervalRef);
      //   if (audioRef.current.ended) {
      //     // toNextTrack();
      //   } else {
      //   console.log(startEnd);
      setStartEnd((prev) => [props.audioRef.currentTime, prev[1]]);
      //   }
    }, 1000);
  };

  //   const currentPercentage = audioCtx.currentTime
  //     ? `${(audioCtx.currentTime / source!.buffer!.duration!) * 100}%`
  //     : "0%";

  //   setInterval(() => {
  //     console.log(currentPercentage);
  //   }, 10);

  useEffect(() => {}, [props.audioRef]);
  function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
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
  let params = useParams<"guild_id" | "file_name" | "month" | "year">();

  return (
    <Box sx={{ width: 2 / 4 }} className="m-16">
      <Button
        onClick={(e) => {
          if (!playing) {
            props.audioRef.play();
            setPlaying((prev) => !prev);
            startTimer();
            e.currentTarget.innerHTML = "Pause";
          } else {
            setPlaying((prev) => !prev);
            // source?.stop();
            startTimer();

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
        <TinyText>{formatDuration(startEnd[0])} </TinyText>
        <TinyText>
          {formatDuration(Math.round(props.audioRef.duration))}
        </TinyText>
      </Box>
      <Stack
        spacing={40}
        direction="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <VolumeSlider audioRef={props.audioRef} />
        <PlaybackSpeedSlider audioRef={props.audioRef} />
      </Stack>
      <div className="flex">
        <div className="flex-1 w-32">
          value 1: {formatDuration(Math.round(startEnd[0]))}
        </div>
        <div>
          <BasicTextFields startEnd={startEnd} setStartEnd={setStartEnd} />
        </div>
      </div>
      <br />
      value 2: {formatDuration(startEnd[1])}
      <br></br>
      Cropped length: {formatDuration(startEnd[1] - startEnd[0])}
      <br></br>
      <br></br>
      <br></br>
      <Button variant="contained">
        {props.isClip ? (
          <a
            href={`https://dev.patrykstyla.com/audio/clips/${params.guild_id}/${params.file_name}`}
          >
            Download
          </a>
        ) : (
          <a
            href={`https://dev.patrykstyla.com/download/${params.guild_id}/${params.year}/${params.month}/${params.file_name}.ogg`}
          >
            Download
          </a>
        )}
      </Button>
      <ClipDialog params={params} startEnd={startEnd} disabled={props.isClip} />
      <JamIt disabled={props.isClip} userGuilds={props.userGuilds} />
      {/* <Button variant="contained" onClick={handleClip}>
        <a
          href={`https://dev.patrykstyla.com/download/${params.guild_id}/${
            params.year
          }/${params.month}/${params.file_name}.ogg?start=${startEnd[0]}&end=${
            startEnd[1] - startEnd[0]
          }`}
        >
          Clip
        </a>
      </Button> */}
    </Box>
  );
}

function PlaybackSpeedSlider(props: { audioRef: HTMLAudioElement }) {
  const handleChangePlaybackSpeed = (
    event: Event,
    newValue: number | number[]
  ) => {
    setPlaybackSpeed(newValue as number);
    props.audioRef.playbackRate = newValue as number;
  };
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{ mb: 1, width: 200 }}
      alignItems="center"
    >
      <Slider
        sx={{
          "& .MuiSlider-thumb": {
            // height: 28,
            // width: 28,
          },
        }}
        max={10}
        step={0.1}
        getAriaLabel={() => "Minimum distance"}
        value={playbackSpeed}
        onChange={handleChangePlaybackSpeed}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
      />
    </Stack>
  );
}

function VolumeSlider(props: { audioRef: HTMLAudioElement }) {
  const handleChangeVolume = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    props.audioRef.volume = newValue as number;
  };
  // 0 current volume, 1 prev volume
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  return (
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
  );
}

function YearSelection(props: {
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  guildSelected: UserGuilds | null;
  userGuilds: UserGuilds[] | null;
}) {
  let params = useParams();

  return (
    // render the audio playback functionality if we have the full url

    <div className="flex">
      <AllYears
        setContextMenu={props.setContextMenu}
        setMenuItems={props.setMenuItems}
        setFormOpen={props.setFormOpen}
        guildSelected={props.guildSelected}
      />
      {params.year && (
        <AudioInterface isClip={false} userGuilds={props.userGuilds} />
      )}
    </div>
  );
}

export function AudioInterface(props: {
  isClip: boolean;
  userGuilds: UserGuilds[] | null;
}) {
  console.log("render Audio Interface");
  const intervalRef = useRef<number | undefined>();
  let params = useParams<"guild_id" | "file_name" | "month" | "year">();
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    //TODO: FIX THIS
    let audioRef: HTMLAudioElement;
    if (props.isClip) {
      audioRef = new Audio(
        `https://dev.patrykstyla.com/audio/clips/${
          params.guild_id
        }/${encodeURIComponent(params.file_name!)}`
      );
    } else {
      audioRef = new Audio(
        `https://dev.patrykstyla.com/audio/${params.guild_id}/${params.year}/${
          params.month
        }/${encodeURIComponent(params.file_name!)}.ogg`
      );
    }

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
      <div className="flex-initial w-4/5">
        {readyToPlay ? (
          <RangeSlider
            audioRef={audioRef!}
            intervalRef={intervalRef}
            isClip={props.isClip}
            userGuilds={props.userGuilds}
          />
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
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

const ProtectedLayout = (props: {
  isLoggedIn: boolean;
  guildSelected: UserGuilds | null;
  setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
  userGuilds: UserGuilds[] | null;
}) => {
  if (!props.userGuilds) {
    return <>No guilds</>;
  }
  const handleGuildSelect = (index: number) => {
    props.setGuildSelected(props.userGuilds![index]);
  };

  let guilds = props.userGuilds?.map((value, index) => {
    return (
      <Grid xs={1} key={index}>
        <div onClick={() => handleGuildSelect(index)}>{value.name}</div>
      </Grid>
    );
  });
  if (!props.guildSelected) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        SELECT A SERVER
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          {guilds}
        </Grid>
      </Box>
    );
  }

  return <Outlet />;
};

function Dashboard() {
  return (
    <div>
      TODO: BIG MENU WITH A LOT OF FEATURES THAT WILL SURELY GET ADDED SOON
    </div>
  );
}

let db: IDBDatabase;
const DB: React.Context<IDBDatabase> = createContext(db!);

interface AppProps {}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function LayoutsWithNavbar(props: {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  guildSelected: UserGuilds | null;
  setGuildSelected: React.Dispatch<React.SetStateAction<UserGuilds | null>>;
  userGuilds: UserGuilds[] | null;
}) {
  return (
    <>
      {/* Your navbar component */}
      <ResponsiveAppBar
        isLoggedIn={props.isLoggedIn}
        setIsLoggedIn={props.setIsLoggedIn}
        guildSelected={props.guildSelected}
        setGuildSelected={props.setGuildSelected}
        userGuilds={props.userGuilds}
      />

      {/* This Outlet is the place in which react-router will render your components that you need with the navbar */}
      <Outlet />

      {/* You can add a footer to get fancy in here :) */}
    </>
  );
}

interface User {
  guild_id: string;
  permissions: number;
  icon: number;
  name: string;
}

export interface UserGuilds {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
}

function App({}: AppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userGuilds, setUserGuilds] = useState<UserGuilds[] | null>(null);
  const [guildSelected, setGuildSelected] = useState<UserGuilds | null>(null);

  const getUserDetails = () => {
    let users = fetch("https://dev.patrykstyla.com/api/users/@me", {
      credentials: "include",
    });

    let guilds = fetch("https://dev.patrykstyla.com/api/users/@me/guilds", {
      credentials: "include",
    });

    let token = fetch("https://dev.patrykstyla.com/api/token", {
      credentials: "include",
    });

    Promise.all([users, guilds, token]).then(async (values) => {
      if (!(values[0].status >= 200) || !(values[0].status < 300)) {
        setIsLoading(false);
        return;
      }

      if (!(values[1].status >= 200) || !(values[1].status < 300)) {
        setIsLoading(false);
        return;
      }

      if (!(values[2].status >= 200) || !(values[2].status < 300)) {
        setIsLoading(false);
        return;
      }

      setUser((await values[0].json()) as User);
      setUserGuilds((await values[1].json()) as UserGuilds[]);

      localStorage.setItem("token", (await values[2].json()).token as any);
      setIsLoggedIn(true);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUserDetails();
    } else {
      // do nothing. User is not authenticated
    }
  }, []);

  // This prob way too complicated
  // We pass the setContext menu in order to set the coordinates when the onContextMenu event is triggered
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    file: string | null;
  } | null>(null);

  const [isDbSet, setIsDbSet] = useState(false);
  useEffect(() => {
    window.onmessage = (e) => {
      if (e.origin !== "https://dev.patrykstyla.com") {
        return;
      }

      console.log("message", e);

      // Discord call sucesfull
      if (e.data.success === 1) {
        console.log("Succ");
        setTimeout(() => {
          getUserDetails();
        }, 100);
      } else {
        console.error("sommething failed when authenticating");
      }
    };

    //   window.indexedDB.deleteDatabase("db");
    let openRequest = window.indexedDB.open("db1", 1);

    openRequest.onupgradeneeded = function (e) {
      //   setIsDbSet(true);
      console.log("onupgradeneeded");
      db = (e.target! as any).result as IDBDatabase;
      // triggers if the client had no database
      // ...perform initialization...
      if (!db!.objectStoreNames.contains("ids")) {
        db?.createObjectStore("ids");
      }
    };

    openRequest.onerror = function () {
      console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function () {
      console.log("onsuccess");

      db = openRequest.result;

      setIsDbSet(true);

      // continue working with database using db object
    };

    return () => {
      setIsDbSet(false);
      // remove listener
      window.onmessage = () => {};
    };
  }, []);
  // Indexed DB

  // When the onContextMenu is triggered the clicked element set the menu that it wants to display along with a function to execute to handle the menu
  // TODO: clear the memu items after the menu is closed (in case we forget to override the menu items when we open a new context menu which has no implementation)
  const [menuItems, setMenuItems] = useState<
    { name: string; cb: () => void }[] | null
  >(null);
  const handleClose = (e: any) => {
    // Don't allow the click to click elements below it
    e.stopPropagation();
    setContextMenu(null);
    // This only clears the items when we DON'T select any of the menu items
    // The menu items themselves must clear it or we do something smarter
    // setMenuItems(null);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);

  const menu = menuItems?.map((el, value) => {
    return (
      <MenuItem
        key={value}
        onClick={(e) => {
          el.cb();
          //   setContextMenu(null);
        }}
      >
        {el.name}
      </MenuItem>
    );
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    console.log(event.target as HTMLBaseElement);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            file: null,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  // Return the App component.
  if (!isDbSet || !db || isLoading || !isLoggedIn) {
    if (!isLoggedIn) {
      return (
        <ThemeProvider theme={darkTheme}>
          <BrowserRouter>
            <LayoutsWithNavbar
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              guildSelected={guildSelected}
              setGuildSelected={setGuildSelected}
              userGuilds={userGuilds}
            />
            <div>
              You are not logged in or you are not authorized to view this
              content
            </div>
          </BrowserRouter>
        </ThemeProvider>
      );
    } else {
      return (
        <ThemeProvider theme={darkTheme}>
          <BrowserRouter>
            <LayoutsWithNavbar
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              guildSelected={guildSelected}
              setGuildSelected={setGuildSelected}
              userGuilds={userGuilds}
            />
            <div>
              wait. If it takes too long somehting is broken or you are not
              logged in
            </div>
          </BrowserRouter>
        </ThemeProvider>
      );
    }
  } else {
    return (
      <DB.Provider value={db}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <BrowserRouter>
            {/* <Button variant="contained">Hello World</Button> */}
            <Routes>
              <Route
                path="/"
                element={
                  <LayoutsWithNavbar
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    guildSelected={guildSelected}
                    setGuildSelected={setGuildSelected}
                    userGuilds={userGuilds}
                  />
                }
              >
                <Route path="/" element={<div>Void</div>} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedLayout
                      isLoggedIn={isLoggedIn}
                      guildSelected={guildSelected}
                      setGuildSelected={setGuildSelected}
                      userGuilds={userGuilds}
                    />
                  }
                >
                  <Route path="" element={<Dashboard />} />
                  <Route path="audio">
                    <Route
                      path=":guild_id/:year/:month/:file_name"
                      element={
                        <YearSelection
                          setContextMenu={setContextMenu}
                          setMenuItems={setMenuItems}
                          setFormOpen={setIsFormOpen}
                          guildSelected={guildSelected}
                          userGuilds={userGuilds}
                        />
                      }
                    />
                    <Route
                      path=":guild_id"
                      element={
                        <YearSelection
                          setContextMenu={setContextMenu}
                          setMenuItems={setMenuItems}
                          setFormOpen={setIsFormOpen}
                          guildSelected={guildSelected}
                          userGuilds={userGuilds}
                        />
                      }
                    />
                  </Route>
                  <Route path="clips">
                    <Route
                      path=":guild_id"
                      element={
                        <Clips
                          guildSelected={guildSelected}
                          userGuilds={userGuilds}
                        />
                      }
                    />
                    <Route
                      path=":guild_id/:file_name"
                      element={
                        <Clips
                          guildSelected={guildSelected}
                          userGuilds={userGuilds}
                        />
                      }
                    />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Menu
            open={contextMenu !== null}
            onClose={(e) => handleClose(e)}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
            onContextMenu={(e) => handleContextMenu(e)}
          >
            {menu}
          </Menu>
          <FormDialog
            setOpen={setIsFormOpen}
            isOpen={isFormOpen}
            setContextMenu={setContextMenu}
            contextMenu={contextMenu}
          />
        </ThemeProvider>
      </DB.Provider>
    );
  }
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
    `${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${
      params.guild_id
    }/${year}/${month_name}${e.currentTarget.innerHTML.slice(0, -4)}`
  ) {
    // same location dont do anything
  } else {
    navigate(
      `${PATH_PREFIX_FOR_LOGGED_USERS}/audio/${
        params.guild_id
      }/${year}/${month_name}/${e.currentTarget.innerHTML.slice(0, -4)}`
    );
  }
}

function ItemsEl(props: {
  file: IndividualFile;
  year: number;
  month_name: string;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  favorites: {
    favorites: IndividualFileArray | null;
    setFavorites: React.Dispatch<
      React.SetStateAction<IndividualFileArray | null>
    >;
  };
}) {
  let navigate = useNavigate();
  let location = useLocation();
  let params = useParams();

  const DBcontext = useContext(DB!);

  const handleFavorite = (e: any) => {
    // Don't allow the click to click elements below it
    e.stopPropagation();
    // props.setContextMenu(null);
    props.setFormOpen(true);
    if (props.file.comment) {
      // is in fav remove it
      let transaction = DBcontext.transaction("ids", "readwrite");
      let ids = transaction.objectStore("ids"); // (2)

      let request = ids.delete(props.file.file);

      request.onsuccess = function () {
        // (4)
        console.log("Book deleted to the store", request.result);

        props.favorites.setFavorites((prev) =>
          prev!.filter((item) => item.file !== props.file.file)
        );
      };

      request.onerror = function () {
        console.log("Error", request.error);
      };
    } else {
      let transaction = DBcontext.transaction("ids", "readwrite");
      let ids = transaction.objectStore("ids"); // (2)

      let request = ids.put("", props.file.file);

      request.onsuccess = function () {
        // (4)

        props.favorites.setFavorites((prev) => [
          ...prev!,
          { comment: props.file.comment, file: props.file.file },
        ]);
      };

      request.onerror = function () {
        console.log("Error", request.error);
      };
    }
  };

  return (
    <Tooltip title={props.file.comment ? props.file.comment : ""}>
      <div
        className={`${
          props.file.comment !== null ? "bg-orange-600" : "bg-violet-600"
        } `}
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
        style={{ cursor: "context-menu" }}
        onContextMenu={(e) => {
          handleContextMenu(e, props.setContextMenu, props.file.file);
          props.file.comment !== null
            ? props.setMenuItems([
                {
                  name: "Remove From Favorite",
                  cb: () => {
                    handleFavorite(e);
                  },
                },
              ])
            : props.setMenuItems([
                {
                  name: "Add To Favorite",
                  cb: () => {
                    handleFavorite(e);
                  },
                },
              ]);
        }}
      >
        {props.file.file}
      </div>
    </Tooltip>
  );
}

enum RespStatus {
  CONNECTED,
  NOT_CONNECTED,
  UNKOWN,
}

function JamIt(props: { disabled: boolean; userGuilds: UserGuilds[] | null }) {
  if (!props.disabled) return <></>;

  let [isError, setIsError] = useState<{ type: RespStatus; code: number }>({
    type: RespStatus.UNKOWN,
    code: 0,
  });
  let location = useLocation();
  let params = useParams();

  const handleJamIt = async () => {
    let req = fetch("https://dev.patrykstyla.com/jamit", {
      body: JSON.stringify({
        guild_id: params.guild_id as any as string,
        clip_name: params.file_name as any as string,
      }),

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    let res = await req;
    if (!res.ok) {
      setIsError({ type: RespStatus.NOT_CONNECTED, code: 0 });
      setOpen(true);

      return;
    }
    let c = await res.json();

    console.log(c);

    if (c.code) {
      setIsError({ type: RespStatus.CONNECTED, code: c.code as number });
      setOpen(true);
    } else {
      // prob success or unhandled
    }
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false), setIsError({ type: RespStatus.CONNECTED, code: 0 });
  };

  return (
    <>
      <Button onClick={handleJamIt} variant="contained">
        Jam It
      </Button>
      {/* if Error show a modal explaining the error */}
      {(isError.code > 0 || isError.type === RespStatus.NOT_CONNECTED) && (
        <div>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Error
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                error code: {isError.code}
                <br />
                TODO: proper messages
                <br />
                number 0 = I probably broke something
                <br />
                number 1 = bot is not in voice channel
                <br />
                number &gt;= 2 =¯\_(ツ)_/¯
              </Typography>
            </Box>
          </Modal>
        </div>
      )}
    </>
  );
}

function ClipDialog(props: {
  params: Readonly<Params<"file_name" | "guild_id" | "month" | "year">>;
  startEnd: number[];
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
    setText("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        disabled={props.disabled}
      >
        Clip
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Enter a name for this clip. Will return an error if name is a
            duplicate. Leave blank for default name
          </DialogContentText>
          <TextField
            value={text}
            onChange={(e) => {
              setText(e.currentTarget.value);
            }}
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button onClick={handleClose}>
            <a
              href={`https://dev.patrykstyla.com/download/${
                props.params.guild_id
              }/${props.params.year}/${props.params.month}/${
                props.params.file_name
              }.ogg?start=${props.startEnd[0]}&end=${
                props.startEnd[1] - props.startEnd[0]
              }${text.length > 0 ? `&name=${text}` : ""}`}
            >
              Clip
            </a>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function FormDialog(props: {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  contextMenu: {
    mouseX: number;
    mouseY: number;
    file: string | null;
  } | null;
}) {
  //   const DBcontext = useContext(DB);

  //   let transaction = DBcontext.transaction("ids", "readwrite");
  //   let ids = transaction.objectStore("ids"); // (2)

  //   let request = ids.add("a", "b");

  //   request.onsuccess = function () {
  //     // (4)
  //     console.log("Book added to the store", request.result);
  //   };

  //   request.onerror = function () {
  //     console.log("Error", request.error);
  //   };

  const DBcontext = useContext(DB!);
  const [formText, setFormText] = useState("");

  const handleClickOpen = () => {
    props.setOpen(true);
  };

  const handleClose = () => {
    props.setContextMenu(null);
    props.setOpen(false);
  };

  const handleAddNote = () => {
    let transaction = DBcontext.transaction("ids", "readwrite");
    let ids = transaction.objectStore("ids"); // (2)

    let request = ids.put(formText, props.contextMenu!.file!);

    request.onsuccess = function () {
      // (4)
    };

    request.onerror = function () {
      console.log("Error", request.error);
    };
    props.setOpen(false);
  };

  return (
    <div>
      <Dialog open={props.isOpen} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Add a custom note for the recording
          </DialogContentText>
          <TextField
            value={formText}
            onChange={(e) => {
              setFormText(e.currentTarget.value);
            }}
            autoFocus
            margin="dense"
            id="name"
            label="Note"
            type="text"
            fullWidth
            variant="standard"
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddNote}>Add Note</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function DayEl(props: {
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  day: number;
  files: IndividualFileArray;
  year: number;
  month_name: string;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  favorites: {
    favorites: IndividualFileArray | null;
    setFavorites: React.Dispatch<
      React.SetStateAction<IndividualFileArray | null>
    >;
  };
}) {
  const contentEl = useRef<HTMLDivElement>(null);
  // state to keep one accordion open
  const itemsEl = props.files.map((el, index) => {
    return (
      <ItemsEl
        file={el}
        month_name={props.month_name}
        year={props.year}
        key={index}
        setContextMenu={props.setContextMenu}
        setMenuItems={props.setMenuItems}
        setFormOpen={props.setFormOpen}
        favorites={{
          favorites: props.favorites.favorites,
          setFavorites: props.favorites.setFavorites,
        }}
      />
    );
  });
  return (
    <>
      <div
        onClick={() => props.onToggle(props.index)}
        onContextMenu={(e) => {
          console.log("days");
        }}
        className="bg-pink-700"
      >
        {props.day}
      </div>
      <div
        key={props.index}
        className="bg-green-500 overflow-hidden"
        ref={contentEl}
        style={props.active ? { display: "block" } : { display: "none" }}
      >
        {itemsEl}
      </div>
    </>
  );
}

// TODO: extra day element
function MonthsEl(props: {
  files: { file: string; comment: string | null }[];
  month_name: months;
  year: number;
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  favorites: {
    favorites: IndividualFileArray | null;
    setFavorites: React.Dispatch<
      React.SetStateAction<IndividualFileArray | null>
    >;
  };
}) {
  const [clicked, setClicked] = useState(-1);
  const contentEl = useRef<HTMLDivElement>(null);
  const handleToggle = (index: number) => {
    // We start indexing from 0 so no selection is anyhting lower or higher that our current index
    if (clicked === index) {
      return setClicked(-1);
    }
    setClicked(index);
  };

  // sort the array
  props.files.sort((a, b) => a.file.localeCompare(b.file));
  // keep the day index
  let prevDay = 0;

  let file_names: IndividualFileArray = [];
  const days = props.files.map((el, index) => {
    // get the timestamp from the file
    let timestamp = parseInt(el.file.slice(0, 13));
    var date = new Date(timestamp);

    // Return a different day el
    if (prevDay != date.getDate()) {
      file_names = [];
      file_names.push({ file: el.file, comment: el.comment });

      prevDay = date.getDate();
      return (
        <DayEl
          active={clicked === index}
          index={index}
          onToggle={() => handleToggle(index)}
          day={date.getDate()}
          files={file_names}
          month_name={props.month_name}
          year={props.year}
          key={index}
          setContextMenu={props.setContextMenu}
          setMenuItems={props.setMenuItems}
          setFormOpen={props.setFormOpen}
          favorites={{
            favorites: props.favorites.favorites,
            setFavorites: props.favorites.setFavorites,
          }}
        />
      );
    } else {
      file_names.push({ file: el.file, comment: el.comment });

      // reset the files for that day
      //   file_names = [];
    }
  });

  return (
    <Fragment>
      <div
        onClick={() => props.onToggle(props.index)}
        onContextMenu={(e) => {
          console.log("months");
        }}
        className="bg-blue-700"
      >
        {props.month_name}
      </div>
      <div
        key={props.index}
        className="bg-green-500 overflow-hidden"
        ref={contentEl}
        style={props.active ? { display: "block" } : { display: "none" }}
      >
        {days}
      </div>
    </Fragment>
  );
}

const handleContextMenu = (
  event: React.MouseEvent,
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >,
  file: string | null = null
) => {
  console.log(event.target as HTMLBaseElement);
  event.preventDefault();
  setContextMenu((contextMenu) =>
    contextMenu === null
      ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          file: file,
        }
      : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
        // Other native context menus might behave different.
        // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null
  );
};

// a year will return up to 12 months
function YearsEl(props: {
  el: Dirs;
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  favorites: {
    favorites: IndividualFileArray | null;
    setFavorites: React.Dispatch<
      React.SetStateAction<IndividualFileArray | null>
    >;
  };
}) {
  const [clicked, setClicked] = useState(-1);
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
        month_name={month}
        year={props.el.year}
        active={clicked === index}
        onToggle={() => handleToggle(index)}
        key={index}
        files={files}
        setContextMenu={props.setContextMenu}
        setMenuItems={props.setMenuItems}
        setFormOpen={props.setFormOpen}
        favorites={{
          favorites: props.favorites.favorites,
          setFavorites: props.favorites.setFavorites,
        }}
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
        onClick={(e) => {
          props.onToggle(props.index);
        }}
        onContextMenu={(e) => {
          handleContextMenu(e, props.setContextMenu);
          props.setMenuItems([
            {
              name: "test 1",
              cb: () => {
                console.log("test 1");
              },
            },
            {
              name: "test 2",
              cb: () => {
                console.log("test 2");
              },
            },
          ]);
          console.log("Years");
        }}
      >
        {props.el.year}
      </div>
      <div
        key={props.index}
        className="bg-green-500 overflow-hidden"
        ref={contentEl}
        style={props.active ? { display: "block" } : { display: "none" }}
      >
        {result}
      </div>
    </>
  );
}

function Favorites(props: {
  index: number;
  onToggle: (index: number) => void;
  active: boolean;
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  favorites: {
    favorites: IndividualFileArray | null;
    setFavorites: React.Dispatch<
      React.SetStateAction<IndividualFileArray | null>
    >;
  };
}) {
  let items: JSX.Element[] = [];
  if (props.favorites.favorites) {
    props.favorites.favorites.forEach((el, index) => {
      let timestamp = parseInt(el.file.slice(0, 13));
      var date = new Date(timestamp);

      let item = (
        <ItemsEl
          key={index}
          file={el}
          month_name={Months[date.getMonth()] as any as string}
          year={date.getFullYear()}
          setContextMenu={props.setContextMenu}
          setMenuItems={props.setMenuItems}
          setFormOpen={props.setFormOpen}
          favorites={{
            favorites: props.favorites.favorites,
            setFavorites: props.favorites.setFavorites,
          }}
        ></ItemsEl>
      );

      items.push(item);
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
            props.onToggle(props.index);
          }}
        >
          Favorites
        </div>
        <div
          key={props.index}
          className="bg-green-500 overflow-hidden"
          style={props.active ? { display: "block" } : { display: "none" }}
        >
          {items}
        </div>
      </>
    );
  } else {
    return <div>No favs</div>;
  }
}

function AllYears(props: {
  setContextMenu: React.Dispatch<
    React.SetStateAction<{
      mouseX: number;
      mouseY: number;
      file: string | null;
    } | null>
  >;
  setMenuItems: React.Dispatch<
    React.SetStateAction<
      | {
          name: string;
          cb: () => void;
        }[]
      | null
    >
  >;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  guildSelected: UserGuilds | null;
}) {
  // get directory data
  const [data, setData] = useState<Dirs[] | null>(null);
  const [favorites, setFavorites] = useState<IndividualFileArray | null>(null);
  const params = useParams();
  const DBcontext = useContext(DB!);
  useEffect(() => {
    fetch(`https://dev.patrykstyla.com/current/${params.guild_id}`, {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      if (!response.ok) {
        console.log("cannot get guild_iddirectory data");
      } else {
        console.log("got directory data");
        response.json().then((result: Dirs[]) => {
          let { newData, newFavorites } = addCommentsToData(result, DBcontext);

          setData(newData);
          setFavorites(newFavorites);
        });
      }
    });
  }, [props.guildSelected]);
  const [clicked, setClicked] = useState(-1);

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
          setContextMenu={props.setContextMenu}
          setMenuItems={props.setMenuItems}
          setFormOpen={props.setFormOpen}
          favorites={{ favorites: favorites, setFavorites: setFavorites }}
        />
      );
    });
    return (
      <div className="flex-initial w-1/5">
        {years}
        <Favorites
          key={2}
          active={clicked === 2}
          index={2}
          favorites={{ favorites: favorites, setFavorites: setFavorites }}
          onToggle={() => handleToggle(2)}
          setContextMenu={props.setContextMenu}
          setMenuItems={props.setMenuItems}
          setFormOpen={props.setFormOpen}
        />
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
function addCommentsToData(data: Dirs[], db: IDBDatabase) {
  let transaction = db.transaction("ids", "readonly");
  let ids = transaction.objectStore("ids");
  const favorites: IndividualFileArray = [];

  data.forEach((el, index) => {
    let months_obj = Object.keys(el.months);
    months_obj.forEach((month_name, index1) => {
      let month = month_name as months;
      el.months[month].forEach((dirs, dirs_index) => {
        let request = ids.get(dirs.file);

        request.onsuccess = function () {
          if (request.result !== undefined) {
            dirs.comment = request.result;
            favorites.push({ comment: request.result, file: dirs.file });
          }
        };

        request.onerror = function () {
          console.log("Error", request.error);
        };
      });
    });
  });

  return { newData: data, newFavorites: favorites };
}
export default App;
