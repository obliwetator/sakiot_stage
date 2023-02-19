import { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useParams } from "react-router-dom";
import {
  AudioInterface,
  PATH_PREFIX_FOR_LOGGED_USERS,
  UserGuilds,
} from "./App";

function SimpleAccordion(props: { data: Clips[] }) {
  let navigate = useNavigate();

  const handleClickAccordion = (guild_id: string, clip_name: string) => {
    console.log("here");
    if (
      location.pathname ===
      `${PATH_PREFIX_FOR_LOGGED_USERS}/clips/${guild_id}/${encodeURIComponent(
        clip_name
      )}`
    ) {
      // do nothing
    } else {
      navigate(
        `${PATH_PREFIX_FOR_LOGGED_USERS}/clips/${guild_id}/${encodeURIComponent(
          clip_name
        )}`
      );
    }
  };
  let elements = props.data.map((el, index) => {
    return (
      <Accordion
        key={index}
        onClick={() => {
          handleClickAccordion(el.guild_id, el.clip_name);
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>CLIP_NAME: {el.clip_name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>SOME BS</Typography>
          <Typography>BY(not working): {el.user_id}</Typography>
          <Typography>start: {el.clip_start}</Typography>
          <Typography>end: {el.clip_end}</Typography>
          <Typography>OG file: {el.file_name}</Typography>
        </AccordionDetails>
      </Accordion>
    );
  });
  return <div>{elements}</div>;
}

interface Clips {
  // big int
  user_id: string;
  clip_name: string;
  file_name: string;
  clip_start: number;
  clip_end: number;
  // big int
  guild_id: string;
  // big int
  id: string;
}

export default function Clips(props: {
  guildSelected: UserGuilds | null;
  userGuilds: UserGuilds[] | null;
}) {
  let params = useParams();
  const [data, setData] = useState<Clips[] | null>(null);

  useEffect(() => {
    fetch(
      `https://dev.patrykstyla.com/audio/clips/${props.guildSelected?.id}`
    ).then((response) => {
      if (!response.ok) {
        console.log("cannot get clip data");
      } else {
        response.json().then((result: Clips[]) => {
          setData(result);
        });
      }
    });
  }, [props.guildSelected]);

  if (data) {
    return (
      <div className="flex">
        <SimpleAccordion data={data} />
        {params.file_name && (
          <AudioInterface isClip={true} userGuilds={props.userGuilds} />
        )}
      </div>
    );
  } else {
    return <div>No clip data</div>;
  }
}
