import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;

public class MusicPlayerServer {

    public static void main(String[] args) throws Exception {
        int port = 9090;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        System.out.println("=================================================");
        System.out.println("Starting Java Music Player Server on port " + port);
        System.out.println("Open your browser to: http://localhost:" + port);
        System.out.println("=================================================");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        // Pointing to the dist folder one level up, since this server will be run from the java-server folder
        private final String baseDir = "C:/Users/vanig/OneDrive/Documents/musicplayer-main/musicplayer-new/dist";

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }

            File file = new File(baseDir + path);
            if (!file.exists() || file.isDirectory()) {
                String response = "404 (Not Found)\n";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }

            String contentType = getContentType(file);
            exchange.getResponseHeaders().set("Content-Type", contentType);

            // Handle range requests for Safari/iOS compatibility with audio
            exchange.sendResponseHeaders(200, file.length());
            try (OutputStream os = exchange.getResponseBody(); FileInputStream fs = new FileInputStream(file)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer, 0, count);
                }
            } catch (Exception e) {
                // Ignore connection resets when client closes stream
            }
        }

        private String getContentType(File file) {
            String name = file.getName().toLowerCase();
            if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (name.endsWith(".css")) return "text/css; charset=UTF-8";
            if (name.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (name.endsWith(".json")) return "application/json; charset=UTF-8";
            if (name.endsWith(".png")) return "image/png";
            if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
            if (name.endsWith(".svg")) return "image/svg+xml";
            if (name.endsWith(".mp3")) return "audio/mpeg";
            try {
                String type = Files.probeContentType(file.toPath());
                return type != null ? type : "application/octet-stream";
            } catch (IOException e) {
                return "application/octet-stream";
            }
        }
    }
}