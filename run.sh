cd client
npm i
npm run build
cd ..
rm -rf build
cp -R ./client/build ./


# # Build
# docker build -t hhaluk/mocktail .

docker build -t hhaluk/testipa:latest .

# # Run
  docker run -p 7080:7080 -d hhaluk/testipa

# # Push
#  docker push hhaluk/mocktail:latest hhaluk/mocktail:v1.0.0



