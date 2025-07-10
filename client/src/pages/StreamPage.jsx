import { useParams } from 'react-router-dom';
import StreamPlayer from '../components/streams/StreamPlayer';

export default function StreamPage() {
  const { streamId } = useParams();
  return (
    <div>
      <StreamPlayer streamId={streamId} />
    </div>
  );
}