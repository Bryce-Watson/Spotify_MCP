const fs = require('fs')
const {json} = require("node:stream/consumers");

exports.getSpotToken = () => {
    const fileRead = fs.readFileSync("Electron_Main/userSpotifyToken.txt", "utf-8")
    if (fileRead === "") {return false}
    const json_dumped = JSON.parse(fileRead)
    return json_dumped.access_token
}

exports.getSpotRefreshToken = () => {
    const fileRead = fs.readFileSync("Electron_Main/userSpotifyToken.txt", "utf-8")
    if (fileRead === "") {return false}
    const json_dumped = JSON.parse(fileRead)
    console.log(json_dumped.refresh_token)
    return json_dumped.refresh_token
}

exports.getSpotExpiresIn = () => {
    const fileRead = fs.readFileSync("Electron_Main/userSpotifyToken.txt", "utf-8")
    if (fileRead === "") {return false}
    const json_dumped = JSON.parse(fileRead)
    console.log("23" + json_dumped.expires_in)
    return json_dumped.expires_in
}

exports.getHeader = () => {
    return {
        'Authorization': 'Bearer ' + exports.getSpotToken()
    }
}

exports.myFunctions = {
    get_current_track: async function () { // might need to pass users origianl question
        const header = exports.getHeader()
        const current_track = await fetch("https://api.spotify.com/v1/me/player/currently-playing",
            {method: "GET", headers: header})


        const current_track_data = await current_track.json()

        const important_data = {
            album_name: current_track_data.item.album.name,
            track_name: current_track_data.item.name,
            track_href: current_track_data.item.href,
            album_href: current_track_data.item.album.href,
            album_id: current_track_data.item.album.id,
            track_id: current_track_data.item.id,
            artists: current_track_data.item.artists

        }


        return `You previously requested the tool "get_current_track".

The tool has now returned authoritative data. This data is complete and correct.

Your task:
- Interpret the tool output
- Answer the user's original question using this data
- Provide a concise, engaging summary of the current track

Guidelines:
- Speak directly to the user
- Do NOT mention tools, APIs, or internal steps
- If information is missing, say so explicitly
- Always produce a final response

Tool result:
${JSON.stringify(important_data, null, 2)}

Now generate the final answer.`

        /* EX:
        {
          is_playing: true,
          timestamp: 1768002786560,
          context: {
            external_urls: {
              spotify: 'https://open.spotify.com/album/6uO5B6km2Dco28tOBmZtSU'
            },
            href: 'https://api.spotify.com/v1/albums/6uO5B6km2Dco28tOBmZtSU',
            type: 'album',
            uri: 'spotify:album:6uO5B6km2Dco28tOBmZtSU'
          },
          progress_ms: 96151,
          item: {
            album: {
              album_type: 'album',
              artists: [Array],
              available_markets: [Array],
              external_urls: [Object],
              href: 'https://api.spotify.com/v1/albums/6uO5B6km2Dco28tOBmZtSU',
              id: '6uO5B6km2Dco28tOBmZtSU',
              images: [Array],
              name: 'The Campfire Headphase',
              release_date: '2005-10-17',
              release_date_precision: 'day',
              total_tracks: 15,
              type: 'album',
              uri: 'spotify:album:6uO5B6km2Dco28tOBmZtSU'
            },
            artists: [ [Object] ],
            available_markets: [
              'AR', 'AU', 'AT', 'BE', 'BO', 'BR', 'BG', 'CA', 'CL', 'CO',
              'CR', 'CY', 'CZ', 'DK', 'DO', 'DE', 'EC', 'EE', 'SV', 'FI',
              'FR', 'GR', 'GT', 'HN', 'HK', 'HU', 'IS', 'IE', 'IT', 'LV',
              'LT', 'LU', 'MY', 'MT', 'MX', 'NL', 'NZ', 'NI', 'NO', 'PA',
              'PY', 'PE', 'PH', 'PL', 'PT', 'SG', 'SK', 'ES', 'SE', 'CH',
              'TW', 'TR', 'UY', 'US', 'GB', 'AD', 'LI', 'MC', 'ID', 'JP',
              'TH', 'VN', 'RO', 'IL', 'ZA', 'SA', 'AE', 'BH', 'QA', 'OM',
              'KW', 'EG', 'MA', 'DZ', 'TN', 'LB', 'JO', 'PS', 'IN', 'BY',
              'KZ', 'MD', 'UA', 'AL', 'BA', 'HR', 'ME', 'MK', 'RS', 'SI',
              'KR', 'BD', 'PK', 'LK', 'GH', 'KE', 'NG', 'TZ', 'UG', 'AG',
              ... 85 more items
            ],
            disc_number: 1,
            duration_ms: 300186,
            explicit: false,
            external_ids: { isrc: 'GBBPW0500098' },
            external_urls: {
              spotify: 'https://open.spotify.com/track/2J4lJMCuFCA0zlwFOjePD5'
            },
            href: 'https://api.spotify.com/v1/tracks/2J4lJMCuFCA0zlwFOjePD5',
            id: '2J4lJMCuFCA0zlwFOjePD5',
            is_local: false,
            name: 'Dayvan Cowboy',
            popularity: 52,
            preview_url: null,
            track_number: 5,
            type: 'track',
            uri: 'spotify:track:2J4lJMCuFCA0zlwFOjePD5'
          },
          currently_playing_type: 'track',
          actions: { disallows: { resuming: true } }
        }

         */
    }
}