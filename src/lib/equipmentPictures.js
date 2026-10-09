export const pictureFields = ['image', 'imageSource', 'imageAssetSource', 'imageCredit', 'imageKind', 'imageReview', 'imageModel', 'imageRetrievedAt', 'imageSha256', 'imageWidth', 'imageHeight', 'imageRights', 'imageSourcePath', 'imageSourceLabel'];

// An older draft can inherit newly documented pictures without losing its edited specs.
export function withPictureDefaults(item, shared) {
  if (!shared?.image || (item.image && item.image !== shared.image)) return item;
  const inherited = Object.fromEntries(pictureFields.filter(key => shared[key] !== undefined).map(key => [key, shared[key]]));
  if (!item.image) return {...item, ...inherited};
  return {...inherited, ...item};
}

// A replacement must never retain the downloaded vendor photo's attribution or checksum.
export function replacePicture(item, image) {
  if (image === item.image) return item;
  const next = {...item, image};
  for (const key of pictureFields) if (key !== 'image') delete next[key];
  if (image) Object.assign(next, {imageKind: 'User-supplied picture', imageCredit: 'User-provided', imageReview: 'Record the picture source and confirm the equipment shown.'});
  return next;
}
