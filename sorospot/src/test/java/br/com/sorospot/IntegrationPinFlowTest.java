package br.com.sorospot;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class IntegrationPinFlowTest {

    @Autowired
    private MockMvc mvc;

    @Test
    public void createUpdateDeleteFlow() throws Exception {
        MockMultipartFile img = new MockMultipartFile("image", "img.jpg", "image/jpeg", "hello".getBytes());

        var create = mvc.perform(multipart("/api/maps/markers")
                .file(img)
                .param("lat", "-23.5")
                .param("lng", "-47.45")
                .param("title", "itest")
                .param("description", "desc")
                .param("color", "#112233")
                .header("X-User-Email", "itest@sorospot.local")
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.photos", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        String content = create.getResponse().getContentAsString();
        // extrai o id usando regex
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"id\":(\\d+)").matcher(content);
        m.find();
        Integer id = Integer.valueOf(m.group(1));

        // adicionar outra foto e editar título, removendo a primeira foto
        MockMultipartFile img2 = new MockMultipartFile("image", "img2.jpg", "image/jpeg", "world".getBytes());

        // extrair a primeira foto
        java.util.regex.Matcher p = java.util.regex.Pattern.compile("\\\"photos\\\":\\[\\\"([^\\\"]+)\\\"").matcher(content);
        String firstPhoto = null;
        if (p.find()) firstPhoto = p.group(1);

        var putReq = multipart("/api/maps/markers/" + id)
                .file(img2)
                .param("title", "itest-edited")
                .param("removePhotos", firstPhoto == null ? "" : firstPhoto)
                .header("X-User-Email", "itest@sorospot.local")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(request -> { request.setMethod("PUT"); return request; });

        mvc.perform(putReq)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("itest-edited"));

        // deletar
        mvc.perform(delete("/api/maps/markers/" + id).header("X-User-Email", "itest@sorospot.local"))
                .andExpect(status().isNoContent());
    }
}
