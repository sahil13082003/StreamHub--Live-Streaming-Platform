// server/services/rtmpServer.js
import NodeMediaServer from 'node-media-server'
import Stream from '../models/Stream.js'
import User from '../models/User.js'

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  }
}

const nms = new NodeMediaServer(config)

nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/').pop()
  
  try {
    const stream = await Stream.findOne({ streamKey })
    if (!stream) {
      const session = nms.getSession(id)
      session.reject()
      return
    }

    // Verify streamer is authorized
    const streamer = await User.findById(stream.streamer)
    if (!streamer || streamer.role !== 'streamer') {
      const session = nms.getSession(id)
      session.reject()
      return
    }

    // Update stream status
    await Stream.findByIdAndUpdate(stream._id, { isLive: true })
    await User.findByIdAndUpdate(stream.streamer, { isLive: true })
    
    console.log(`Stream ${stream._id} is now live`)
  } catch (err) {
    console.error('prePublish error:', err)
    const session = nms.getSession(id)
    session.reject()
  }
})

nms.on('donePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/').pop()
  
  try {
    const stream = await Stream.findOne({ streamKey })
    if (stream) {
      // Update stream status
      await Stream.findByIdAndUpdate(stream._id, { 
        isLive: false,
        endTime: Date.now()
      })
      await User.findByIdAndUpdate(stream.streamer, { 
        isLive: false,
        currentStream: null
      })
      
      console.log(`Stream ${stream._id} has ended`)
    }
  } catch (err) {
    console.error('donePublish error:', err)
  }
})

export default nms