import { useState } from 'react';
import { ImageOff, Download, Maximize2 } from 'lucide-react';
import { External, localPath } from './UI.jsx';

export function EquipmentPicture({item}) {
  const [failed, setFailed] = useState(false);
  if (failed || !item.image) return <div className="equipment-media-empty"><ImageOff size={28}/><p>{failed ? 'Picture could not be loaded.' : 'No equipment picture added yet.'}</p><small>{failed ? 'Check the local picture path in Admin.' : 'Attach a picture in Admin.'}</small></div>;
  return <a className="equipment-picture-link" href={localPath(item.image)} target="_blank" rel="noreferrer" aria-label={`Open full picture of ${item.name}`}><img src={localPath(item.image)} alt={item.imageModel || `${item.name} reference`} onError={()=>setFailed(true)}/><span><Maximize2 size={13}/>Open image</span></a>;
}

export function PictureSource({item}) {
  if (!item.image) return null;
  return <div className="picture-source"><div className="picture-source-heading"><strong>{item.imageKind || 'Equipment picture'}</strong>{item.imageCredit && <span>{item.imageCredit}</span>}</div>{item.imageReview && <p>{item.imageReview}</p>}<div className="picture-source-links">{item.imageSource && <External href={item.imageSource}>Picture source</External>}{item.imageSourcePath && <a href={localPath(item.imageSourcePath)} target="_blank" rel="noreferrer">{item.imageSourceLabel || 'Original reference'}</a>}{item.imageAssetSource && <External href={item.imageAssetSource}>Original image</External>}<a href={localPath(item.image)} download><Download size={13}/>Download picture</a></div>{item.imageRetrievedAt && <small>Recorded {item.imageRetrievedAt}{item.imageWidth && item.imageHeight ? ` · ${item.imageWidth} × ${item.imageHeight} px` : ''}</small>}</div>;
}
